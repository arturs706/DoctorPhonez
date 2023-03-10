use axum::{
    routing::{post, put, get},
    Router,
    headers::HeaderName,
};
use tower_cookies::CookieManagerLayer;
use dotenv::dotenv;
mod userroutes;
use tower_http::cors::{CorsLayer, AllowOrigin};
use userroutes::{user_reg, success_reg, get_users};
use http::header::HeaderValue;
use http::Method;
use sqlx::{postgres::PgPoolOptions, Pool, Postgres};
mod customerrors;

#[derive(Clone)]

pub struct AppState {
    pub database: Database,
    pub accesstoken: AccessToken,
    pub refreshtoken: RefreshToken,
    pub passrecovertoken: PasswordRecoveryToken,
    pub emailvertoken: EmailVerificationToken,
    pub smtpusername: Smtpusername,
    pub smtppassword: Smtppassword
}


#[derive(Clone)]
pub struct Database {
    pub db: Pool<Postgres>,
}
#[derive(Clone)]
pub struct AccessToken {
    pub accesstoken: String
}
#[derive(Clone)]
pub struct RefreshToken {
    pub refreshtoken: String
}
#[derive(Clone)]
pub struct PasswordRecoveryToken {
    pub passrecovertoken: String
}

#[derive(Clone)]

pub struct EmailVerificationToken {
    pub emailvertoken: String
}

#[derive(Clone)]

pub struct Smtpusername {
    pub smtpusername: String
}

#[derive(Clone)]

pub struct Smtppassword {
    pub smtppassword: String
}

#[tokio::main]
async fn main() {
    dotenv().ok();

    let database_url: String = std::env::var("USER_DATABASE_URL").expect("USER_DATABASE_URL must be set");
    let email_verification_secret: String = std::env::var("EMAIL_VERIFICATION_SECRET").expect("EMAIL_VERIFICATION_SECRET must be set");
    let access_token_secret: String = std::env::var("ACCESS_TOKEN_SECRET").expect("ACCESS_TOKEN_SECRET must be set");
    let refresh_token_secret: String = std::env::var("REFRESH_TOKEN_SECRET").expect("REFRESH_TOKEN_SECRET must be set");
    let reset_passwprd_secret: String = std::env::var("RESET_PASSWORD_SECRET").expect("RESET_PASSWORD_SECRET must be set");
    let smtp_username: String = std::env::var("SMTP_USERNAME").expect("SMTP_USERNAME must be set");
    let smtp_password: String = std::env::var("EMAIL_PASSWORD_SECRET").expect("EMAIL_PASSWORD_SECRET must be set");

    let allow_origin: AllowOrigin = HeaderValue::from_static("http://localhost:3000").into();
    let allow_headers = vec!["Content-Type"]
    .iter()
    .map(|s| HeaderName::from_bytes(s.as_bytes()).unwrap())
    .collect::<Vec<_>>();
        let cors = CorsLayer::new()
        .allow_methods(vec![Method::GET, Method::POST, Method::PUT, Method::OPTIONS])
        .allow_credentials(true)
        .allow_origin(allow_origin)
        .allow_headers(allow_headers);


    async fn connect_to_db(database_url: String) -> Pool<Postgres> {
        for _i in 0..5 {
            tokio::time::sleep(std::time::Duration::from_secs(5)).await;
            let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect(&database_url)
            .await
            .expect("Failed to create pool");
            
            if pool.is_closed() {
                continue;
            }
            return pool;
        }
        panic!("Failed to connect to database");
    }
    
    let state = AppState { 
        database: Database { db: connect_to_db(database_url).await },
        accesstoken: AccessToken { accesstoken: access_token_secret },
        refreshtoken: RefreshToken { refreshtoken: refresh_token_secret },
        passrecovertoken: PasswordRecoveryToken { passrecovertoken: reset_passwprd_secret },
        emailvertoken: EmailVerificationToken {emailvertoken: email_verification_secret},
        smtpusername: Smtpusername {smtpusername: smtp_username},
        smtppassword: Smtppassword {smtppassword: smtp_password}
    };
    let app = Router::new()
    .route("/api/v1/users", get(get_users))
    .route("/api/v1/register", post(user_reg))
    .route("/api/v1/register/:token", put(success_reg))
    .layer(cors)
    .layer(CookieManagerLayer::new())
    .with_state(state);
        

   axum::Server::bind(&"0.0.0.0:10000".parse().unwrap())
       .serve(app.into_make_service())
       .await.unwrap();

}
 
