use axum::{
    extract::{State, Path},
    Json,
    response::IntoResponse,
    http::StatusCode,  
};
use chrono::{Duration, Utc};
use lettre::{Message, transport::smtp::authentication::Credentials, SmtpTransport, Transport};
use serde::{Serialize, Deserialize};
use sqlx::{self, FromRow};
use uuid::Uuid;
use core::fmt;
use serde_json::json;
use crate::AppState;
use std::borrow::Cow;
use argon2::{password_hash::{rand_core::OsRng, SaltString},Argon2};
use argon2::PasswordHasher;
use jsonwebtoken::{Algorithm, DecodingKey, EncodingKey, Header, Validation};

//token details 

pub enum Role {
    User,
    Admin,
}

impl Role {
    pub fn _from_str(role: &str) -> Role {
        match role {
            "Admin" => Role::Admin,
            _ => Role::User,
        }
    }
}

impl fmt::Display for Role {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Role::User => write!(f, "User"),
            Role::Admin => write!(f, "Admin"),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]

pub struct ClaimsAccessToken {
    pub sub: Uuid,
    pub exp: i64,
    pub iat: i64,
    pub role: String,
}


impl ClaimsAccessToken {
    pub fn new(id: Uuid, role: Role) -> Self {
        let iat = Utc::now();
        let exp = iat + Duration::minutes(1);
        Self {
            sub: id,
            iat: iat.timestamp(),
            exp: exp.timestamp(),
            role: role.to_string(),
        }
    }
}



//User model for register
#[derive(Serialize, Deserialize, FromRow, Debug)]
pub struct UserReg {
    fullname: String,
    dob: String,
    gender: String,
    mob_phone: String,
    email: String,
    passwd: String
}

//User model for get all users
#[derive(Serialize, FromRow, Debug)]
struct UserFetch {
    usid: Uuid,
    fullname: String,
    dob: String,
    gender: String,
    mob_phone: String,
    email: String,
    created_at: chrono::DateTime<chrono::Utc>
}

#[derive(Serialize, Deserialize, FromRow, Debug)]
pub struct User {
    fullname: String,
    dob: String,
    gender: String,
    mob_phone: String,
    email: String
}


#[derive(Serialize, FromRow, Debug)]
struct VerificationRes {
    email_ver: bool
}

#[derive(Serialize, FromRow, Debug)]
struct TokenRes {
    email_ver_token: String
}




//reg route handler
pub async fn user_reg(State(state): State<AppState>, req: Json<UserReg>) -> impl IntoResponse {
    let usid = sqlx::types::Uuid::from_u128(uuid::Uuid::new_v4().as_u128());
    let argon2 = Argon2::default();
    let salt = SaltString::generate(&mut OsRng);
    let password_hash = argon2
        .hash_password(req.passwd.as_bytes(), &salt)
        .unwrap()
        .to_string();
    let role_access = match req.email.as_str() {
        "21515838@student.uwl.ac.uk" => Role::Admin,
        "21437262@student.uwl.ac.uk" => Role::Admin,
        "21461264@student.uwl.ac.uk" => Role::Admin,
        "20215493@student.uwl.ac.uk" => Role::Admin,
        "21482994@student.uwl.ac.uk" => Role::Admin,
        _ => Role::User
    };
    let email_ver_secret = &state.emailvertoken.emailvertoken.as_bytes();
    let token = jsonwebtoken::encode(
        &Header::new(Algorithm::HS256),
        &ClaimsAccessToken::new(usid, role_access),
        &EncodingKey::from_secret(email_ver_secret),
    )
    .unwrap();
    let mut tx = state.database.db.begin().await.unwrap();
    let _cow = Cow::Borrowed("23505");
    let response = sqlx::query(
            "INSERT INTO users (usid, fullname, dob, gender, mob_phone, email, passwd, email_ver_token, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)")
            .bind(usid)
            .bind(&req.fullname)
            .bind(&req.dob)
            .bind(&req.gender)
            .bind(&req.mob_phone)
            .bind(&req.email)
            .bind(password_hash)
            .bind(&token)
            .bind(chrono::Utc::now())
            .execute(&mut tx)
            .await;
    match response {
        Ok(_) => {
            let smtpususername = state.smtpusername.smtpusername.to_string();
            let smtppassword = state.smtppassword.smtppassword.to_string(); 
            let email = Message::builder()
            .from("DoctorPhonez|LDN <21437262@student.uwl.ac.uk>".parse().unwrap())
            .reply_to("Yuin <21437262@student.uwl.ac.uk>".parse().unwrap())
            .to(req.email.parse().unwrap())
            .subject("Reset Password")
            .body(format!("Click on the link to reset your password: http://localhost:3000/register/{}", token))
            .unwrap();

            let creds = Credentials::new(
                smtpususername,
                smtppassword
            );
            let mailer = SmtpTransport::relay("smtp.gmail.com")
            .unwrap()
            .credentials(creds)
            .build();
        match mailer.send(&email) {
            Ok(_) => {
                tx.commit().await.unwrap();
                return (
                    StatusCode::OK,
                    Json(json!({
                        "status": "success",
                        "message": "Verification email has been sent",
                    })),
                );
            }
            Err(e) => {
                return (
                    StatusCode::BAD_REQUEST,
                    Json(json!({
                        "status": e.to_string(),
                        "message": "Failed to send an email",
                    })),
                );
            }
        }
    },
        Err(e) => 
        match e {
            sqlx::Error::Database(e) => {
                println!("{:?}", &req.email);
                let isverified = sqlx::query_as::<_, VerificationRes>("SELECT email_ver FROM users WHERE email = $1")
                .bind(&req.email)
                .fetch_one(&state.database.db)
                .await
                .expect("Failed to fetch email verification status");
                tx.rollback().await.unwrap();
                match e.code() {
                    Some(_cow) => 
                    match isverified {
                        VerificationRes {email_ver: false} => (
                            StatusCode::CONFLICT,
                            Json(json!({
                                "status": "error",
                                "message": "Under verification, please check your email"
                            })),
                        ),
                        VerificationRes {email_ver: true} => (
                            StatusCode::CONFLICT,
                            Json(json!({
                                "status": "error",
                                "message": "Email is already registered, please use a different email"
                            })),
                        ),
                        },
                    _ => (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(json!({
                            "status": "error",
                            "message": "Something went wrong"
                        })),
                    ),
                }
            }
            _ => (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({
                    "status": "error",
                    "message": "Something went wrong"
                })),
            ),
        },
    }
}



pub async fn success_reg(State(state): State<AppState>, Path(token): Path<String>) -> impl IntoResponse {
    let email_ver_secret = &state.emailvertoken.emailvertoken.as_bytes();
    let token_data = jsonwebtoken::decode::<ClaimsAccessToken>(
        &token,
        &DecodingKey::from_secret(email_ver_secret),
        &Validation::new(Algorithm::HS256),
    );

    //check if token is expired
    match token_data {
        Ok(_) => {
            let usid = token_data.as_ref().unwrap().claims.sub;
            let db_token = sqlx::query_as::<_, TokenRes>("SELECT email_ver_token FROM users WHERE usid = $1")
                .bind(usid)
                .fetch_one(&state.database.db)
                .await
                .expect("Failed to fetch token");
            if db_token.email_ver_token == token {
                let mut tx = state.database.db.begin().await.unwrap();
                let notoken = "".to_string();
                let response = sqlx::query(
                    "UPDATE users SET email_ver = true, email_ver_token = $1 WHERE usid = $2")
                    .bind(notoken)
                    .bind(usid)
                    .execute(&mut tx)
                    .await;
                match response {
                    Ok(_) => {
                        tx.commit().await.unwrap();
                        return (
                            StatusCode::OK,
                            Json(json!({
                                "status": "success",
                                "message": "User registered successfully",
                            })),
                        );
                    }
                    Err(e) => {
                        return (
                            StatusCode::INTERNAL_SERVER_ERROR,
                            Json(json!({
                                "status": "error",
                                "message": e.to_string(),
                            })),
                        );
                    }
                }
            } else {
                return (
                    StatusCode::UNAUTHORIZED,
                    Json(json!({
                        "status": "401",
                        "message": "Invalid token",
                    })),
                );
        }
        },
        Err(e) => {
                // ExpiredSignature
            match e.to_string().as_str() {
                "ExpiredSignature" => {
                    return (
                        StatusCode::FORBIDDEN,
                        Json(json!({
                            "status": "403",
                            "message": "Token expired",
                        })),
                    );
                }
                _ => {
                    return (
                        StatusCode::METHOD_NOT_ALLOWED, 
                        Json(json!({
                            "status": "405",
                            "message": e.to_string(),
                        })),
                    );
                }
            }

    }
}
}


pub async fn get_users(State(state): State<AppState>) -> impl IntoResponse {
    let response = sqlx::query_as::<_, User>("SELECT * FROM users")
    .fetch_all(&state.database.db)
    .await;
    match response {
        Ok(users) => (StatusCode::OK, Json(json!({ "users": users }))),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({
                "status": "error",
                "message": "Something went wrong",
                "error": e.to_string(),
            })),
        ),
    }
    

}