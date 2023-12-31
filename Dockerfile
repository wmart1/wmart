FROM crowdbotics/cb-django:3.8-slim-buster AS build
RUN pip install --upgrade pip && \
    pip install django-ssl-smtp
# Copy dependency management files and install app packages to /.venv
RUN pip install djangorestframework 
COPY ./Pipfile ./Pipfile.lock /
RUN PIPENV_VENV_IN_PROJECT=1 pipenv install --deploy


FROM crowdbotics/cb-django:3.8-slim-buster AS release
ARG SECRET_KEY

# Set Working directory
WORKDIR /opt/webapp

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3-dev libpq-dev gcc curl g++ \
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
  && rm -rf /var/lib/apt/lists/*
  # You can add additional steps to the build by appending commands down here using the
  # format `&& <command>`. Remember to add a `\` at the end of LOC 12.
  # WARNING: Changes to this file may cause unexpected behaviors when building the app.
  # Change it at your own risk.


RUN apt-get update \
    && apt-get install -y binutils libproj-dev gdal-bin python3-gdal --fix-missing

# Add runtime user with respective access permissions
RUN groupadd -r django \
  && useradd -d /opt/webapp -r -g django django \
  && chown django:django -R /opt/webapp
USER django


# Copy virtual env from build stage
COPY --chown=django:django --from=build /.venv /.venv
ENV PATH="/.venv/bin:$PATH"

# Copy app source
COPY --chown=django:django . .

# Collect static files and serve app
RUN python3 manage.py collectstatic --no-input
CMD waitress-serve --port=$PORT wash_and_fold_34887.wsgi:application
