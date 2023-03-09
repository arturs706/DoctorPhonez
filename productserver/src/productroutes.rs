use std::collections::BTreeMap;

use crate::AppState;
use actix_web::web::Json;
use actix_web::{
    get,
    web::Data,
    HttpResponse, post,
};
use serde::{Serialize, Deserialize};
use uuid::Uuid;
use surrealdb::sql::parse;
use surrealdb::sql::Value as ValueX;


#[derive(Serialize)]

struct Products {
    productid : Uuid,
    prodname: String,
    proddescr: String,
    productbrand: String,
    productcategory: String,
    storage: String,
    color: String,
    availableqty: i64,
    price: String,
    imageone: String,
    imagetwo: String,
    imagethree: String,
    imagefour: String,
    created_at: chrono::DateTime<chrono::Utc>
}


#[derive(Serialize, Deserialize, Debug)]
pub struct Product {
    prodname: String,
    proddescr: String,
    productbrand: String,
    productcategory: String,
    storage: String,
    color: String,
    availableqty: i64,
    price: String,
    modelnr: String,
    imageone: String,
    imagetwo: String,
    imagethree: String,
    imagefour: String
}


#[derive(Debug)]
pub struct SurrealDbError(surrealdb::Error);

impl actix_web::ResponseError for SurrealDbError {
    fn error_response(&self) -> HttpResponse {
        // Create an appropriate HTTP response for the error
        HttpResponse::InternalServerError().finish()
    }
}

impl std::fmt::Display for SurrealDbError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "SurrealDbError({})", self.0)
    }
}

impl Serialize for SurrealDbError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&format!("{}", self.0))
    }
}

macro_rules! map {
    ($($k:expr => $v:expr),* $(,)?) => {{
		let mut m = ::std::collections::BTreeMap::new();
        $(m.insert($k, $v);)+
        m
    }};
  }


//create a table for products and define product modelnr to be unique and not null
#[post("/api/v1/products/create")]
pub async fn createproducts(state: Data<AppState>) -> Result<HttpResponse, SurrealDbError> {
    let db = &state.db;
    let ses = &state.session.clone();
    let mut tx = db.transaction(true, false).await.expect("error creating transaction");
    let ast_ref = parse("
                                DEFINE TABLE products SCHEMAFULL;
                                DEFINE FIELD productid ON TABLE products TYPE string
                                ASSERT $value != NONE;
                                DEFINE FIELD prodname ON TABLE products TYPE string
                                ASSERT $value != NONE;
                                DEFINE FIELD proddescr ON TABLE products TYPE string
                                ASSERT $value != NONE;
                                DEFINE FIELD productbrand ON TABLE products TYPE string
                                ASSERT $value != NONE;
                                DEFINE FIELD productcategory ON TABLE products TYPE string
                                ASSERT $value != NONE;
                                DEFINE FIELD storage ON TABLE products TYPE string
                                ASSERT $value != NONE;
                                DEFINE FIELD color ON TABLE products TYPE string
                                ASSERT $value != NONE;
                                DEFINE FIELD availableqty ON TABLE products TYPE int
                                ASSERT $value != NONE;
                                DEFINE FIELD price ON TABLE products TYPE string
                                ASSERT $value != NONE;
                                DEFINE FIELD modelnr ON TABLE products TYPE string
                                ASSERT $value != NONE;
                                DEFINE FIELD imageone ON TABLE products TYPE string
                                ASSERT $value != NONE;
                                DEFINE FIELD imagetwo ON TABLE products TYPE string
                                ASSERT $value != NONE;
                                DEFINE FIELD imagethree ON TABLE products TYPE string
                                ASSERT $value != NONE;
                                DEFINE FIELD imagefour ON TABLE products TYPE string
                                ASSERT $value != NONE;
                                DEFINE FIELD created_at ON TABLE products TYPE string
                                ASSERT $value != NONE;
                                DEFINE INDEX productModelrIndex ON TABLE products COLUMNS modelnr UNIQUE;").expect("error");

    let ast = ast_ref.clone();
    tx.commit().await.expect("error committing transaction");
    let res = db.process(ast, &ses, None, false).await.map_err(|error| SurrealDbError(error));
    Ok(HttpResponse::Ok().json(res))
}





  #[get("/api/v1/products")]
pub async fn getproducts(state: Data<AppState>) -> Result<HttpResponse, SurrealDbError> {
    let db = &state.db;
    let ses = &state.session.clone();
    let mut tx = db.transaction(true, false).await.expect("error creating transaction");
    let ast_ref = parse("SELECT * FROM products;").expect("error");
    let ast = ast_ref.clone();
    tx.commit().await.expect("error committing transaction");
    let res = db.process(ast, &ses, None, false).await.map_err(|error| SurrealDbError(error));
    Ok(HttpResponse::Ok().json(res))
}

#[post("/api/v1/products")]
pub async fn insertproduct(state: Data<AppState>, body: Json<Product> ) -> Result<HttpResponse, SurrealDbError> {
    let productid = Uuid::new_v4();
    let db = &state.db;
    let ses = &state.session.clone();
    let now = chrono::Utc::now();
    let now_str = now.to_rfc3339();
    let ast_ref = "
    CREATE products SET productid = $productid, prodname = $prodname, proddescr = $proddescr, productbrand = $productbrand, productcategory = $productcategory, color = $color, storage = $storage, availableqty = $availableqty, price = <float> $price, modelnr = $modelnr, imageone = $imageone, imagetwo = $imagetwo, imagethree = $imagethree, imagefour = $imagefour, created_at = $created_at;
    ";
    let values: BTreeMap<String, ValueX> = map![
        "productid".into() => ValueX::from(productid.to_string()),
        "prodname".into() => ValueX::from(body.prodname.clone()),
        "proddescr".into() => ValueX::from(body.proddescr.clone()),
        "productbrand".into() => ValueX::from(body.productbrand.clone()),
        "productcategory".into() => ValueX::from(body.productcategory.clone()),
        "storage".into() => ValueX::from(body.storage.clone()),
        "color".into() => ValueX::from(body.color.clone()),
        "availableqty".into() => ValueX::from(body.availableqty.clone()),
        "modelnr".into() => ValueX::from(body.modelnr.clone()),
        "price".into() => ValueX::from(body.price.clone()),
        "imageone".into() => ValueX::from(body.imageone.clone()),
        "imagetwo".into() => ValueX::from(body.imagetwo.clone()),
        "imagethree".into() => ValueX::from(body.imagethree.clone()),
        "imagefour".into() => ValueX::from(body.imagefour.clone()),
        "created_at".into() => ValueX::from(now_str)
    ];

    let res = db.execute(&ast_ref.to_string(), &ses, Some(values), false).await.map_err(|error| SurrealDbError(error));
    Ok(HttpResponse::Ok().json(res))
}

//create a route that retrieves only last 6 added products
#[get("/api/v1/products/recent")]
pub async fn getrecentproducts(state: Data<AppState>) -> Result<HttpResponse, SurrealDbError> {
    let db = &state.db;
    let ses = &state.session.clone();
    let mut tx = db.transaction(true, false).await.expect("error creating transaction");
    let ast_ref = parse("SELECT * FROM products ORDER BY created_at DESC LIMIT 4;").expect("error");
    let ast = ast_ref.clone();
    tx.commit().await.expect("error committing transaction");
    let res = db.process(ast, &ses, None, false).await.map_err(|error| SurrealDbError(error));
    Ok(HttpResponse::Ok().json(res))
}

