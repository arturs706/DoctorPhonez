use axum_macros::debug_handler;
use serde::{Deserialize, Serialize};
use sqlx::{self, FromRow};
use uuid::Uuid;
use crate::AppState;
use axum::{Json, extract::{Path, State}, response::IntoResponse, http::StatusCode};
use serde_json::json;


#[derive(Serialize, FromRow, Debug)]

struct Products {
    prodname: String,
    proddescr: String,
    brand: String,
    category: String,
    modelnr: String,
    availableqty: i64,
    price: String,
    productmodel: String,
    color: String,
    memory: String,
    rating: i64,
    imageone: String,
    imagetwo: String,
    imagethree: String,
    imagefour: String,
}

#[debug_handler]

pub async fn gettwoappleproducts(State(state): State<AppState>) -> impl IntoResponse{
    let response = sqlx::query_as::<_, Products>(
        "SELECT products.prodname, products.proddescr, products.brand, products.category, 
        products.modelnr, products.availableqty, products.price, 
        productspecs.color, productspecs.productmodel, productspecs.memory, 
        productspecs.rating, productimages.imageone, productimages.imagetwo, 
        productimages.imagethree, productimages.imagefour
        FROM products
        INNER JOIN productspecs 
        ON products.modelnr  = productspecs.productmodel
        INNER JOIN productimages
        ON products.modelnr = productimages.productmodel
        WHERE products.prodname LIKE '%SIM Free iPhone 14 Pro Max 5G Mobile Phone%'
        ORDER BY random()
        LIMIT 2;
 "
)
        .fetch_all(&state.database.db)
        .await;
        match response {
            Ok(products) => (StatusCode::OK , Json(json!({
                "products": products
            }))),
            Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({
                "status": "error",
                "message": "Something went wrong",
                "error": e.to_string(),
            }))),
        }
        
    }



#[debug_handler]

pub async fn getappleproducts(State(state): State<AppState>) -> impl IntoResponse{
    let response = sqlx::query_as::<_, Products>(
        "SELECT products.prodname, products.proddescr, products.brand, products.category, 
        products.modelnr, products.availableqty, products.price, 
        productspecs.color, productspecs.productmodel, productspecs.memory, 
        productspecs.rating, productimages.imageone, productimages.imagetwo, 
        productimages.imagethree, productimages.imagefour
        FROM products
        INNER JOIN productspecs 
        ON products.modelnr  = productspecs.productmodel
        INNER JOIN productimages
        ON products.modelnr = productimages.productmodel
        WHERE products.brand = 'Apple'
        ORDER BY random()
 "
)
        .fetch_all(&state.database.db)
        .await;
        match response {
            Ok(products) => (StatusCode::OK , Json(json!({
                "products": products
            }))),
            Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({
                "status": "error",
                "message": "Something went wrong",
                "error": e.to_string(),
            }))),
        }
        
    }


    #[debug_handler]

pub async fn getsamsungproducts(State(state): State<AppState>) -> impl IntoResponse{
    let response = sqlx::query_as::<_, Products>(
        "SELECT products.prodname, products.proddescr, products.brand, products.category, 
        products.modelnr, products.availableqty, products.price, 
        productspecs.color, productspecs.productmodel, productspecs.memory, 
        productspecs.rating, productimages.imageone, productimages.imagetwo, 
        productimages.imagethree, productimages.imagefour
        FROM products
        INNER JOIN productspecs 
        ON products.modelnr  = productspecs.productmodel
        INNER JOIN productimages
        ON products.modelnr = productimages.productmodel
        WHERE products.brand = 'Samsung'
        ORDER BY random()
 "
)
        .fetch_all(&state.database.db)
        .await;
        match response {
            Ok(products) => (StatusCode::OK , Json(json!({
                "products": products
            }))),
            Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({
                "status": "error",
                "message": "Something went wrong",
                "error": e.to_string(),
            }))),
        }
        
    }