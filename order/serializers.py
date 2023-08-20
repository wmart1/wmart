from decimal import Decimal
from rest_framework import serializers
from django.db.models import Sum
from django.utils import timezone

from home.utility import send_notification
from payments.models import Payment, MoneyTransfer


from users.serializers import UserProfileSerializer
from serviceproviders.serializers import ServiceProviderSerializer
from services.models import AdminFee, ExtraService
from .models import Item, Order, OrderItem

import stripe
import djstripe


class ItemSerializer(serializers.ModelSerializer):
    """
    A data representation of the Item options to add to an order
    """
    class Meta:
        model = Item
        fields = '__all__'


class OrderItemSerializer(serializers.ModelSerializer):
    """
    A data representation of the set of items assigned to an order
    """

    class Meta:
        model = OrderItem
        fields = '__all__'

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['item'] = ItemSerializer(
            instance.item
        ).data
        return rep


class OrderSerializer(serializers.ModelSerializer):
    """
    A data representation of a customer's Order
    """
    items = OrderItemSerializer(
        many=True
    )

    class Meta:
        model = Order
        fields = '__all__'
        extra_kwargs = {'location': {'required': True},
                        'user': {'required': False},
                        'status': {'required': False},
                        'total_weight': {'required': False}}

    def create(self, validated_data):
        user =  self.context['request'].user
        if user.account:
            customer_id = user.account.id
        else:
            raise serializers.ValidationError('Missing user payment info')
        pms = stripe.PaymentMethod.list(customer=customer_id, type='card')
        payment_method_id = None
        for method in pms:
            payment_method_id = method.id
            break
        if not payment_method_id:
            raise serializers.ValidationError('No payment info on file')
        items_data = validated_data.pop('items')
        order = super().create(validated_data)
        for item_data in items_data:
            OrderItem.objects.create(
                    **item_data,
                    order=order
                )
        order.total_price = order.items.aggregate(
            Sum('total_item_price')
        )['total_item_price__sum']
        if order.type == "Wash and Fold":
            weight_price = ExtraService.objects.filter(
                name="Weight"
            ).values_list('price', flat=True)[0]
            order.total_price += order.total_weight * weight_price
        if order.special_detergent:
            detergent_price = ExtraService.objects.filter(
                name="Special Detergent"
            ).values_list('price', flat=True)[0]
            if order.type == "Wash and Fold":
                order.total_price += order.total_weight * (detergent_price / 5)
            else:
                order.total_price += detergent_price
        if order.special_softener:
            softener_price = ExtraService.objects.filter(
                name="Special Softener"
            ).values_list('price', flat=True)[0]
            if order.type == "Wash and Fold":
                order.total_price += order.total_weight * (softener_price / 5)
            else:
                order.total_price += softener_price
        if order.intensive_clean:
            intensive_price = ExtraService.objects.filter(
                name="Intensive Clean"
            ).values_list('price', flat=True)[0]
            if order.type == "Wash and Fold":
                order.total_price += order.total_weight * (intensive_price / 5)
            else:
                order.total_price += intensive_price
        if order.priority:
            priority_price = ExtraService.objects.filter(
                name="Priority"
            ).values_list('price', flat=True)[0]
            order.total_price = order.total_price * (1 + (priority_price / 100))
        order.save()
        return order

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)

        if 'status' in validated_data:
            if validated_data['status'] == 'Completed':
                send_notification(
                    user=instance.user,
                    title="Your order has been completed by one of our Service Providers",
                    content="Your order has been completed by one of our Service Providers",
                    data=instance.id,
                    data_type='orderId',
                )
                # Transfer funds to the Service Providers Stripe Connected Account

                fee = AdminFee.objects.filter(active=True).first()
                if fee is not None:
                    fee = (fee.amount) / 100
                else:
                    fee = 0.1

                provider_amount = instance.after_tax_total  * Decimal((1 - fee))
                provider_account_id = instance.service_provider.account.id
                instance.service_provider.generated_revenue += instance.after_tax_total
                instance.service_provider.earnings += provider_amount
                instance.service_provider.number_of_orders += 1
                instance.service_provider.save()

                instance.user.customer.total_spent += instance.after_tax_total
                instance.user.customer.number_of_requests += 1
                instance.user.customer.save()
                transfer_amount = int(provider_amount * Decimal(100))
                # transfer = stripe.Transfer.create(
                #     amount=transfer_amount,
                #     currency='usd',
                #     destination=provider_account_id,
                #     transfer_group=instance.id,
                # )
                # djstripe_transfer = djstripe.models.Transfer.sync_from_stripe_data(transfer)
                # can be added in live mode commented due payout issue 
                MoneyTransfer.objects.create(
                    order=instance,
                    service_provider=instance.service_provider,
                    amount=provider_amount,
                    # transfer=djstripe_transfer
                )
                
        order = super().update(instance, validated_data)

        if items_data:
            for item_data in items_data:
                try:
                    order_item = OrderItem.objects.get(item=item_data['item'], order=order)
                except OrderItem.DoesNotExist:
                    OrderItem.objects.create(
                            **item_data,
                            order=order
                        )
                else:
                    if item_data['quantity'] == 0:
                        order_item.delete()
                    else:
                        order_item.quantity = item_data['quantity']
                        order_item.save()
        order.total_price = order.items.aggregate(
            Sum('total_item_price')
        )['total_item_price__sum']
        if order.special_detergent:
            detergent_price = ExtraService.objects.filter(
                name="Special Detergent"
            ).values_list('price', flat=True)[0]
            if order.type == "Wash and Fold":
                order.total_price += order.total_weight * (detergent_price / 5)
            else:
                order.total_price += detergent_price
        if order.special_softener:
            softener_price = ExtraService.objects.filter(
                name="Special Softener"
            ).values_list('price', flat=True)[0]
            if order.type == "Wash and Fold":
                order.total_price += order.total_weight * (softener_price / 5)
            else:
                order.total_price += softener_price
        if order.intensive_clean:
            intensive_price = ExtraService.objects.filter(
                name="Intensive Clean"
            ).values_list('price', flat=True)[0]
            if order.type == "Wash and Fold":
                order.total_price += order.total_weight * (intensive_price / 5)
            else:
                order.total_price += intensive_price
        if order.priority:
            priority_price = ExtraService.objects.filter(
                name="Priority"
            ).values_list('price', flat=True)[0]
            order.total_price = order.total_price * (1 + (priority_price / 100))

        order.save()
        return order

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if instance.service_provider:
            rep['service_provider'] = ServiceProviderSerializer(
                instance.service_provider
            ).data
        if instance.user:
            rep['user'] = UserProfileSerializer(
                instance.user
            ).data
        return rep
