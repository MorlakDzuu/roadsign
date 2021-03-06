CREATE TABLE users
(
    id serial NOT NULL,
    name character varying NOT NULL,
    phone_number character varying UNIQUE NOT NULL,
    role character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE sms_auth_data (
    phone_number character varying PRIMARY KEY,
    sms_code character varying,
    sms_expired_time TIMESTAMP
);

CREATE TABLE signs
(
    id serial NOT NULL,
    lat float NOT NULL,
    lon float NOT NULL,
    user_id integer NOT NULL,
    name character varying NOT NULL,
    photo character varying NOT NULL,
    address character varying NOT NULL,
    direction integer NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE confirmed_signs
(
    id serial NOT NULL,
    "sign_id" integer NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("sign_id")
        REFERENCES public.signs (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
);

CREATE TABLE processing_queue
(
    id serial NOT NULL,
    "sign_id" integer NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY ("sign_id")
            REFERENCES public.signs (id) MATCH SIMPLE
            ON UPDATE CASCADE
            ON DELETE CASCADE
            NOT VALID
);