from django.core.mail import EmailMessage
from rest_framework.authtoken.models import Token
import pyotp

from notifications.models import Notification

import requests
from requests.structures import CaseInsensitiveDict

from wash_and_fold_34887.settings import FCM_SERVER_KEY


url = "https://fcm.googleapis.com/fcm/send"

headers = CaseInsensitiveDict()
headers["Accept"] = "application/json"
headers["Authorization"] = "key={}".format(FCM_SERVER_KEY)
headers["Content-Type"] = "application/json"


def send_notification(user, title, content, data=None, data_type=None):
    notif = Notification.objects.create(
            user=user,
            title=title,
            content=content,
            data=data,
            data_type=data_type,
    )
    notif_id = str(notif)
    if user.registration_id:
        if data is None:
            payload = {
                    'to': user.registration_id,
                    'notification': {
                        "title": title,
                        "text": content
                    },
                    'data': {
                        "notif_id": notif_id,
                    }
                }
        elif data and data_type:
            data = str(data)
            data_type = str(data_type)
            payload = {
                    'to': user.registration_id,
                    'notification': {
                        "title": title,
                        "text": content
                    },
                    'data': {
                        "type": data_type,
                        "redirect_id": data,
                        "notif_id": notif_id,
                    }
                }
        resp = requests.post(url, headers=headers, json=payload)

def send_multiple_notifications(users, title, content, data=None, data_type=None):
    registration_ids = []
    data = str(data)
    data_type = str(data_type)
    for user in users:
        Notification.objects.create(
            user=user,
            title=title,
            content=content,
            data=data,
            data_type=data_type,
        )
        if user.registration_id:
            registration_ids.append(user.registration_id)
    if registration_ids:
        if data is None or data_type is None:
            payload = {
                    'registration_ids': registration_ids,
                    'notification': {
                        "title": title,
                        "text": content
                    }
                }
            resp = requests.post(url, headers=headers, json=payload)
        elif data and data_type:
            payload = {
                    'registration_ids': registration_ids,
                    'notification': {
                        "title": title,
                        "text": content
                    },
                    'data': {
                        "type": data_type,
                        "redirect_id": data,
                    }
                }
            resp = requests.post(url, headers=headers, json=payload)

def generateOTP(email=None, user=None):
    if email and user:
        secret = pyotp.random_base32()
        totp = pyotp.TOTP(secret)
        otp = totp.now()
        user.activation_key = secret
        user.otp = otp
        user.save()
        sliced_otp = str(otp)[:4]
        email = EmailMessage('Wmart - OTP Verification', 'Your OTP is {}'.format(sliced_otp), from_email='Wmartproject123@gmail.com', to=[email])
        email.send()
        return user

def verifyOTP(otp=None, activation_key=None, user=None):
    if otp and activation_key and user:
        totp = pyotp.TOTP(activation_key)
        sliced_otp = user.otp[:4]
        if otp == sliced_otp:
            return totp.verify(user.otp, valid_window=6)
        return False
    else:
        return False

def send_otp(user):
    email = user.email
    secret = pyotp.random_base32()
    totp = pyotp.TOTP(secret)
    otp = totp.now()
    user.activation_key = secret
    user.otp = otp
    user.save()
    sliced_otp = str(otp)[:4]
    email_body = """\
            <html>
            <head></head>
            <body>
            <p>
            Hi,<br>
            Your OTP is %s<br>
            Regards,<br>
            Team wmart
            </p>
            </body>
            </html>
            """ % (sliced_otp)
    email_msg = EmailMessage("Password Reset - Wmart", email_body, from_email='Wmartproject123@gmail.com', to=[email])
    email_msg.content_subtype = "html"
    email_msg.send()

def auth_token(user):
    token, created = Token.objects.get_or_create(user=user)
    return token

def send_password_reset_email(user):
    email = user.email
    token, created = Token.objects.get_or_create(user=user)
    link = "http://35.167.203.216:8000/?token={}".format(token)
    email_body = """\
            <html>
            <head></head>
            <body>
            <p>
            Hi,<br>
            Please visit the following link to reset your password <br><br>
            <a href="%s">%s</a><br>
            Regards,<br>
            Team wmart
            </p>
            </body>
            </html>
            """ % (link, link)
    email_msg = EmailMessage("Password Reset - Wmart", email_body, from_email='Wmartproject123@gmail.com', to=[email])
    email_msg.content_subtype = "html"
    email_msg.send()
