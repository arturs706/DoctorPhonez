use axum_macros::debug_handler;
use serde::{Deserialize, Serialize};
use sqlx::{self, FromRow};
use uuid::Uuid;
use crate::AppState;
use axum::{Json, extract::{Path, State}, response::IntoResponse, http::StatusCode};
use serde_json::json;


#[derive(Serialize, FromRow, Debug)]

struct Products {
    productid: Uuid,
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
        "SELECT products.productid, products.prodname, products.proddescr, products.brand, products.category, 
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

pub async fn getallproducts(State(state): State<AppState>) -> impl IntoResponse{
    let response = sqlx::query_as::<_, Products>(
        "SELECT products.productid, products.prodname, products.proddescr, products.brand, products.category, 
        products.modelnr, products.availableqty, products.price, 
        productspecs.color, productspecs.productmodel, productspecs.memory, 
        productspecs.rating, productimages.imageone, productimages.imagetwo, 
        productimages.imagethree, productimages.imagefour
        FROM products
        INNER JOIN productspecs 
        ON products.modelnr  = productspecs.productmodel
        INNER JOIN productimages
        ON products.modelnr = productimages.productmodel
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

    pub async fn getsingleproduct(State(state): State<AppState>, Path(productid): Path<Uuid>) -> impl IntoResponse{
        let response = sqlx::query_as::<_, Products>(
            "SELECT products.productid, products.prodname, products.proddescr, products.brand, products.category, 
            products.modelnr, products.availableqty, products.price, 
            productspecs.color, productspecs.productmodel, productspecs.memory, 
            productspecs.rating, productimages.imageone, productimages.imagetwo, 
            productimages.imagethree, productimages.imagefour
            FROM products
            INNER JOIN productspecs 
            ON products.modelnr  = productspecs.productmodel
            INNER JOIN productimages
            ON products.modelnr = productimages.productmodel
            where productid = $1"

    )
        .bind(productid)
        .fetch_all(&state.database.db)
        .await;
        match response {
            Ok(product) => (StatusCode::OK , Json(json!({
                "product": product,
                "status": "success",
            }))),
            Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({
                "status": "error",
                "message": "Something went wrong",
                "error": e.to_string(),
            }))),
        }
    }
    

    #[debug_handler]


    pub async fn getcategory(State(state): State<AppState>, Path(category): Path<String>) -> impl IntoResponse{
        let response = sqlx::query_as::<_, Products>(
            "SELECT products.productid, products.prodname, products.proddescr, products.brand, products.category, 
            products.modelnr, products.availableqty, products.price, 
            productspecs.color, productspecs.productmodel, productspecs.memory, 
            productspecs.rating, productimages.imageone, productimages.imagetwo, 
            productimages.imagethree, productimages.imagefour
            FROM products
            INNER JOIN productspecs 
            ON products.modelnr  = productspecs.productmodel
            INNER JOIN productimages
            ON products.modelnr = productimages.productmodel
            where products.category = $1
            ORDER BY random()
            "
            
    )
        .bind(category)
        .fetch_all(&state.database.db)
        .await;
        match response {
            Ok(product) => (StatusCode::OK , Json(json!({
                "product": product,
                "status": "success",
            }))),
            Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({
                "status": "error",
                "message": "Something went wrong",
                "error": e.to_string(),
            }))),
        }
    }



    pub async fn getcategorybrand(State(state): State<AppState>, Path((category, brand)): Path<(String, String)>) -> impl IntoResponse{
        let response = sqlx::query_as::<_, Products>(
            "SELECT products.productid, products.prodname, products.proddescr, products.brand, products.category, 
            products.modelnr, products.availableqty, products.price, 
            productspecs.color, productspecs.productmodel, productspecs.memory, 
            productspecs.rating, productimages.imageone, productimages.imagetwo, 
            productimages.imagethree, productimages.imagefour
            FROM products
            INNER JOIN productspecs 
            ON products.modelnr  = productspecs.productmodel
            INNER JOIN productimages
            ON products.modelnr = productimages.productmodel
            where products.category = $1 AND products.brand = $2
            ORDER BY random()
            "
    )
        .bind(category)
        .bind(brand)
        .fetch_all(&state.database.db)
        .await;
        match response {
            Ok(product) => (StatusCode::OK , Json(json!({
                "product": product,
                "status": "success",
            }))),
            Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({
                "status": "error",
                "message": "Something went wrong",
                "error": e.to_string(),
            }))),
        }
    }
    

    pub async fn getcategorybrandsingle(State(state): State<AppState>, Path((category, brand, productid)): Path<(String, String, Uuid)>) -> impl IntoResponse{
        let response = sqlx::query_as::<_, Products>(
            "SELECT products.productid, products.prodname, products.proddescr, products.brand, products.category, 
            products.modelnr, products.availableqty, products.price, 
            productspecs.color, productspecs.productmodel, productspecs.memory, 
            productspecs.rating, productimages.imageone, productimages.imagetwo, 
            productimages.imagethree, productimages.imagefour
            FROM products
            INNER JOIN productspecs 
            ON products.modelnr  = productspecs.productmodel
            INNER JOIN productimages
            ON products.modelnr = productimages.productmodel
            where products.category = $1 AND products.brand = $2 AND products.productid = $3
            "
    )
        .bind(category)
        .bind(brand)
        .bind(productid)
        .fetch_all(&state.database.db)
        .await;
        match response {
            Ok(product) => (StatusCode::OK , Json(json!({
                "product": product,
                "status": "success",
            }))),
            Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({
                "status": "error",
                "message": "Something went wrong",
                "error": e.to_string(),
            }))),
        }
    }
    