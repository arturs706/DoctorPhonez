use axum::{
    routing::{post, put, get},
    Router,
    headers::HeaderName,
};
use tower_cookies::CookieManagerLayer;
use dotenv::dotenv;
use tower_http::cors::{CorsLayer, AllowOrigin};
use http::header::HeaderValue;
use http::Method;
use sqlx::{postgres::PgPoolOptions, Pool, Postgres};
mod productroutes;
use productroutes::{gettwoappleproducts, getappleproducts, getsamsungproducts, getsingleproduct};




#[derive(Clone)]

pub struct AppState {
    pub database: Database,
    pub stripetoken: StripeToken,
    pub stripepubtoken: StripePublicToken,
}


#[derive(Clone)]
pub struct Database {
    pub db: Pool<Postgres>,
}
#[derive(Clone)]
pub struct StripeToken {
    pub stripetoken: String
}
#[derive(Clone)]
pub struct StripePublicToken {
    pub stripepubtoken: String
}

#[tokio::main]
async fn main() {
    dotenv().ok();

    let database_url: String = std::env::var("LOCAL_PRODUCTS_DATABASE_URL").expect("LOCAL_PRODUCTS_DATABASE_URL must be set");
    let stripe_token_secret: String = std::env::var("STRIPE_SECRET_KEY").expect("STRIPE_SECRET_KEY must be set");
    let stripe_public_secret: String = std::env::var("STRIPE_PUBLISH_KEY").expect("STRIPE_PUBLISH_KEY must be set");

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
        stripetoken: StripeToken { stripetoken: stripe_token_secret },
        stripepubtoken: StripePublicToken { stripepubtoken: stripe_public_secret },
    };
    let app = Router::new()
    .route("/api/v1/products/apple/featured", get(gettwoappleproducts))
    .route("/api/v1/products/apple", get(getappleproducts))
    .route("/api/v1/products/samsung", get(getsamsungproducts))
    .route("/api/v1/products/:productid", get(getsingleproduct))

    .layer(cors)
    .layer(CookieManagerLayer::new())
    .with_state(state);

let server = axum::Server::bind(&"0.0.0.0:10010".parse().unwrap())
.serve(app.into_make_service());

if let Err(err) = server.await {
    eprintln!("server error: {}", err);
}
}
 
