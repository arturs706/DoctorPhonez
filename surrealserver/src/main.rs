use std::net::SocketAddr;
use axum::{
    routing::{post, get},
    Router,
    headers::HeaderName,
};
use surrealdb::{engine::remote::ws::{Ws, Client}, opt::auth::Root};
use surrealdb::Surreal;
mod userroutes;
use dotenv::dotenv;
use http::header::HeaderValue;
use http::Method;
use tower_cookies::CookieManagerLayer;
use tower_http::cors::{CorsLayer, AllowOrigin};
use userroutes::{user_reg, get_users};



#[derive(Clone)]

pub struct AppState {
    pub database: Database,
    pub accesstoken: AccessToken,
    pub refreshtoken: RefreshToken,
    pub passrecovertoken: PasswordRecoveryToken,
    pub stripetoken: StripeToken,
    pub stripepubtoken: StripePublicToken,
    pub emailvertoken: EmailVerificationToken,
    pub smtpusername: Smtpusername,
    pub smtppassword: Smtppassword
}

#[derive(Clone)]
pub struct Database {
    db: Surreal<Client>
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
pub struct StripeToken {
    pub stripetoken: String
}
#[derive(Clone)]
pub struct StripePublicToken {
    pub stripepubtoken: String
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
    let db = Surreal::new::<Ws>("172.17.0.1:8000").await.expect("failed to connect to db");
    println!("connected to db");
    db.signin(Root {
        username: "doctorphonez",
        password: "B2OulTcN3qsAslqjAcdddammvsoe5O",
    })
    .await.expect("failed to sign in");
    println!("signed in");
    db.use_ns("doctorphonez").use_db("doctorphonez").await.expect("failed to use namespace");
    println!("using namespace");
    
    let access_token_secret: String = std::env::var("ACCESS_TOKEN_SECRET").expect("ACCESS_TOKEN_SECRET must be set");
    let refresh_token_secret: String = std::env::var("REFRESH_TOKEN_SECRET").expect("REFRESH_TOKEN_SECRET must be set");
    let stripe_token_secret: String = std::env::var("STRIPE_SECRET_KEY").expect("STRIPE_SECRET_KEY must be set");
    let stripe_public_secret: String = std::env::var("STRIPE_PUBLISH_KEY").expect("STRIPE_PUBLISH_KEY must be set");
    let reset_passwprd_secret: String = std::env::var("RESET_PASSWORD_SECRET").expect("RESET_PASSWORD_SECRET must be set");
    let email_verification_secret: String = std::env::var("EMAIL_VERIFICATION_SECRET").expect("EMAIL_VERIFICATION_SECRET must be set");
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
    
    println!("connected to db");
    let state = AppState {
        database: Database { db },
        accesstoken: AccessToken { accesstoken: access_token_secret },
        refreshtoken: RefreshToken { refreshtoken: refresh_token_secret },
        passrecovertoken: PasswordRecoveryToken { passrecovertoken: reset_passwprd_secret },
        stripetoken: StripeToken { stripetoken: stripe_token_secret },
        stripepubtoken: StripePublicToken { stripepubtoken: stripe_public_secret },
        emailvertoken: EmailVerificationToken {emailvertoken: email_verification_secret},
        smtpusername: Smtpusername {smtpusername: smtp_username},
        smtppassword: Smtppassword {smtppassword: smtp_password}
    };
    // build our application with a route
    let app = Router::new()
    .route("/api/v1/register", post(user_reg))
    .route("/api/v1/users", get(get_users))
    .layer(cors)
    .layer(CookieManagerLayer::new())
    .with_state(state);

    // run it
    let addr = SocketAddr::from(([0, 0, 0, 0], 11000));
    println!("listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}