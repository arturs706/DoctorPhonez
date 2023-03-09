use crate::AppState;
use axum::Json;
use axum::extract::State;
use axum_macros::debug_handler;
use chrono::{Duration, Utc};
use jsonwebtoken::{Algorithm, EncodingKey, Header};
use serde::{Deserialize, Serialize};
use serde_json::json;
use surrealdb::{opt::auth::Root};
use argon2::{password_hash::{rand_core::OsRng, SaltString},Argon2};
use argon2::PasswordHasher;
use axum::{
    http::{StatusCode},
    response::IntoResponse,
};
use uuid::Uuid;
use core::fmt;
use lettre::{Message, transport::smtp::authentication::Credentials, SmtpTransport, Transport};


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


#[derive(Serialize, Deserialize)]
pub struct UserReg {

    #[serde(skip_serializing)]
    usid: Uuid,
    fullname: String,
    dob: String,
    gender: String,
    mob_phone: String,
    email: String,
    passwd: String,
    token_val: String,
    created_at: chrono::DateTime<chrono::Utc>
}

#[derive(Serialize, Deserialize)]

pub struct User {

    #[serde(skip_serializing)]
    fullname: String,
    dob: String,
    gender: String,
    mob_phone: String,
    email: String,
    passwd: String
}

#[derive(Serialize, Deserialize)]

pub struct FetchUser {

    #[serde(skip_serializing)]
    fullname: String,
    dob: String,
    gender: String,
    mob_phone: String,
    email: String,
    passwd: String
}



#[debug_handler]
pub async fn user_reg(State(state): State<AppState>, req: Json<User>) -> impl IntoResponse {
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
    // let db = &state.database.db;
    // db.signin(Root {
    //     username: "doctorphonez",
    //     password: "B2OulTcN3qsAslqjAcdddammvsoe5O",
    // })
    // .await.unwrap();
    // println!("signed in");
    // db.use_ns("doctorphonez").use_db("doctorphonez").await.unwrap();
    // println!("{:?}", ast_ref);
    let db = &state.database.db;
    let now = chrono::Utc::now();
    let now_str = now.to_rfc3339();
    let sql = "CREATE user SET usid = $usid, fullname = $fullname, dob = $dob, gender = $gender, mob_phone = $mob_phone, email = $email, passwd = $passwd, token_val = $token, created_at = $created_at";

	let results = db
		.query(sql)
		.bind(UserReg {
			usid,
			fullname: req.fullname.to_owned(),
			dob: req.dob.to_owned(),
            gender: req.gender.to_owned(),
            mob_phone: req.mob_phone.to_owned(),
            email: req.email.to_owned(),
            passwd: password_hash.to_owned(),
            token_val: token.to_owned(),
            created_at: now_str.parse().unwrap(),
		})
		.await;
    match results {
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

        }
        Err(e) => {      
            return (
                StatusCode::BAD_REQUEST,
                Json(json!({
                    "status": "error",
                    "message": e.to_string(),
                })),
            );
        }
    }

}



#[debug_handler]

pub async fn get_users(State(state): State<AppState>) -> impl IntoResponse {
    let db = &state.database.db;
    db.signin(Root {
        username: "doctorphonez",
        password: "B2OulTcN3qsAslqjAcdddammvsoe5O",
    })
    .await.unwrap();
    println!("signed in");
    db.use_ns("doctorphonez").use_db("doctorphonez").await.unwrap();
    let users: Vec<User> = db.select("user").await.unwrap();
    if users.len() > 0 {
        return (
            StatusCode::OK,
            Json(json!({
                "status": "success",
                "message": "Users fetched successfully",
                "users": users
            })),
        );
    } else {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({
                "status": "error",
                "message": "No users found",
            })),
        );
    }



    // let users: Option<User> = db.select("users").await
    // match users {
    //     Ok(_) => {
    //         return (
    //             StatusCode::OK,
    //             Json(json!({
    //                 "status": "success",
    //                 "message": "Users fetched successfully",
    //                 "users": users
    //             })),
    //         );
    //     }
    //     Err(e) => {
    //         return (
    //             StatusCode::BAD_REQUEST,
    //             Json(json!({
    //                 "status": "error",
    //                 "message": e.to_string(),
    //             })),
    //         );
    //     }
    // }


}
    

