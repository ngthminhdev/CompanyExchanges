#!/bin/bash

# shellcheck disable=SC2164
cd /SERVICE

CONFIG_ARGS="s|CONFIG_NODE_ENV|${CONFIG_NODE_ENV}|g;\
            s|CONFIG_SERVER_HOST|${CONFIG_SERVER_HOST}|g;\
            s|CONFIG_SERVER_PORT|${CONFIG_SERVER_PORT}|g;\
        	s|CONFIG_API_PREFIX|${CONFIG_API_PREFIX}|g;\
        	s|CONFIG_STRATEGY|${CONFIG_STRATEGY}|g;\
        	s|CONFIG_WHITELIST_IPS|${CONFIG_WHITELIST_IPS}|g;\
        	s|CONFIG_MSSQL_HOST|${CONFIG_MSSQL_HOST}|g;\
        	s|CONFIG_MSSQL_PORT|${CONFIG_MSSQL_PORT}|g;\
        	s|CONFIG_MSSQL_USERNAME|${CONFIG_MSSQL_USERNAME}|g;\
        	s|CONFIG_MSSQL_PASSWORD|${CONFIG_MSSQL_PASSWORD}|g;\
			s|CONFIG_DB_HOST|${CONFIG_DB_HOST}|g;\
        	s|CONFIG_DB_PORT|${CONFIG_DB_PORT}|g;\
        	s|CONFIG_DB_USERNAME|${CONFIG_DB_USERNAME}|g;\
        	s|CONFIG_DB_PASSWORD|${CONFIG_DB_PASSWORD}|g;\
        	s|CONFIG_SECRET_SIGN_KEY|${CONFIG_SECRET_SIGN_KEY}|g;\
        	s|CONFIG_ACCESS_TOKEN_SECRET|${CONFIG_ACCESS_TOKEN_SECRET}|g;\
        	s|CONFIG_REFRESH_TOKEN_SECRET|${CONFIG_REFRESH_TOKEN_SECRET}|g;\
        	s|CONFIG_REDIS_HOST|${CONFIG_REDIS_HOST}|g;\
        	s|CONFIG_REDIS_PORT|${CONFIG_REDIS_PORT}|g;\
        	s|CONFIG_REDIS_PASSWORD|${CONFIG_REDIS_PASSWORD}|g;\
        	s|CONFIG_REDIS_DB|${CONFIG_REDIS_DB}|g;\
        	s|CONFIG_KAFKA_HOST|${CONFIG_KAFKA_HOST}|g;\
        	s|CONFIG_KAFKA_PORT|${CONFIG_KAFKA_PORT}|g;\
        	s|CONFIG_KAFKA_GROUP_ID|${CONFIG_KAFKA_GROUP_ID}|g;\
        	s|CONFIG_KAFKA_CLIENT_ID|${CONFIG_KAFKA_CLIENT_ID}|g;\
        	s|CONFIG_TWILIO_ACCOUNT_SID|${CONFIG_TWILIO_ACCOUNT_SID}|g;\
        	s|CONFIG_TWILIO_AUTH_TOKEN|${CONFIG_TWILIO_AUTH_TOKEN}|g;\
        	s|CONFIG_TWILIO_PHONE_NUMBER|${CONFIG_TWILIO_PHONE_NUMBER}|g;\
        	s|CONFIG_MINIO_ENDPOINT|${CONFIG_MINIO_ENDPOINT}|g;\
        	s|CONFIG_MINIO_PORT|${CONFIG_MINIO_PORT}|g;\
        	s|CONFIG_MINIO_ACCESS_KEY|${CONFIG_MINIO_ACCESS_KEY}|g;\
        	s|CONFIG_MINIO_SECRET_KEY|${CONFIG_MINIO_SECRET_KEY}|g;\
			s|CONFIG_INCOM_SMS_URL|${CONFIG_INCOM_SMS_URL}|g;\
			s|CONFIG_INCOM_SMS_ACCOUNT|${CONFIG_INCOM_SMS_ACCOUNT}|g;\
			s|CONFIG_INCOM_SMS_PASSWORD|${CONFIG_INCOM_SMS_PASSWORD}|g;\
			s|CONFIG_INCOM_SMS_BRAND_NAME|${CONFIG_INCOM_SMS_BRAND_NAME}|g"
sed -i -e "$CONFIG_ARGS" .env

npm start

exec "$@"