CREATE TABLE users
(
    id serial NOT NULL,
    name character varying NOT NULL,
    phone_number character varying UNIQUE NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE sms_auth_data (
    phone_number character varying PRIMARY KEY,
    sms_code character varying,
    sms_expired_time TIMESTAMP
);