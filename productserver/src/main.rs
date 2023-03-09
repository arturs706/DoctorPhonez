use actix_web::{web::Data, App, HttpServer, http};
use std::sync::Arc;
use surrealdb::{Datastore, Session};
mod productroutes;
use dotenv::dotenv;
use actix_cors::Cors;


pub struct AppState {
    db: Arc<Datastore>,
    session: Session
}


impl AppState {
    fn _clone(&self) -> Arc<Datastore> {
        self.db.clone()
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {

    dotenv().ok();
    let db_name: String = std::env::var("POSTGRES_DB").expect("POSTGRES_DB must be set");
    let db_loc: String = std::env::var("POSTGRES_PASSWORD").expect("POSTGRES_PASSWORD must be set");
    let ses = Session::for_kv().with_ns(db_name.as_str()).with_db(db_loc.as_str());
    // let ses: Session = Session::for_sc(db_name.as_str(), db_loc.as_str(), "admin");
    let ds = Datastore::new("file://database.db")
        .await
        .expect("error creating datastore");
    let ds = Arc::new(ds);
    let appstart = move || {
        let cors = Cors::default().allowed_origin("http://localhost:3000")
        .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])
        .allowed_headers(vec![http::header::AUTHORIZATION, http::header::ACCEPT, http::header::CONTENT_TYPE])
        .max_age(3600);
        App::new()
            .app_data(Data::new(AppState { db: ds.clone(), session: ses.clone()}))
            .wrap(cors)
            .service(productroutes::getrecentproducts)
            .service(productroutes::getproducts)
            .service(productroutes::insertproduct)
            .service(productroutes::createproducts)
    };
    HttpServer::new(appstart)
        .bind("0.0.0.0:10010")?
        .run()
        .await
}