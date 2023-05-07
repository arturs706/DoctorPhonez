require('dotenv').config();
const client = require('../db/conn')
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
var moment = require('moment'); 
const cloudinary = require('cloudinary').v2;



const query = `
SELECT products.productid, products.prodname, products.proddescr, products.brand, products.category, 
products.modelnr, products.availableqty, products.price, 
productspecs.color, productspecs.subcolor, productspecs.productmodel, productspecs.memory, 
productspecs.rating, productimages.imageone, productimages.imagetwo, 
productimages.imagethree, productimages.imagefour
FROM products
INNER JOIN productspecs 
ON products.modelnr  = productspecs.productmodel
INNER JOIN productimages
ON products.modelnr = productimages.productmodel
WHERE products.prodname LIKE '%SIM Free iPhone 14 Pro Max 5G 256GB Mobile Phone%'
ORDER BY random()
LIMIT 2;
`;


router.get('/apple/featured', bodyParser.json(), async (req, res) => {
    try {
        const twoappleproducts = await client.query(query);
        res.status(200).json({ products: twoappleproducts.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
      }
});

const QUERY_ALL_PRODUCTS = `
SELECT 
  products.productid, products.prodname, products.proddescr, products.brand, 
  products.category, products.modelnr, products.availableqty, products.price, 
  productspecs.color, productspecs.subcolor, productspecs.productmodel, productspecs.memory, 
  productspecs.rating, productimages.imageone, productimages.imagetwo, 
  productimages.imagethree, productimages.imagefour
FROM 
  products
INNER JOIN 
  productspecs ON products.modelnr = productspecs.productmodel
INNER JOIN 
  productimages ON products.modelnr = productimages.productmodel
`;

router.get('/', bodyParser.json(), async (req, res) => {
    try {
        const allproducts = await client.query(QUERY_ALL_PRODUCTS);
        res.status(200).json({ products: allproducts.rows, "status": "success" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
        }
});

const query_category = `SELECT products.productid, products.prodname, products.proddescr, products.brand, products.category, 
    products.modelnr, products.availableqty, products.price, 
    productspecs.color, productspecs.subcolor, productspecs.productmodel, productspecs.memory, 
    productspecs.rating, productimages.imageone, productimages.imagetwo, 
    productimages.imagethree, productimages.imagefour
    FROM products
    INNER JOIN productspecs 
    ON products.modelnr  = productspecs.productmodel
    INNER JOIN productimages
    ON products.modelnr = productimages.productmodel
    where products.category = $1
`;

router.get('/:category', bodyParser.json(), async (req, res) => {
    const category = req.params.category;
    try {
        const products = await client.query(query_category, [category]);
        res.status(200).json({ products: products.rows, "status": "success"  });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

const query_categorybrand = `SELECT products.productid, products.prodname, products.proddescr, products.brand, products.category, 
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
`;

router.get('/:category/:brand', bodyParser.json(), async (req, res) => {
    const category = req.params.category;
    const brand = req.params.brand;
    try {
        const products = await client.query(query_categorybrand, [category, brand]);
        res.status(200).json({ products: products.rows, "status": "success"});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

const query_categorybrandsingle = `SELECT products.productid, products.prodname, products.proddescr, products.brand, products.category, 
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
`;

router.get('/:category/:brand/:productid', bodyParser.json(), async (req, res) => {
    const category = req.params.category;
    const brand = req.params.brand;
    const productid = req.params.productid;
    try {
        const product = await client.query(query_categorybrandsingle, [category, brand, productid]);
        res.status(200).json({ product: product.rows[0], "status": "success" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});


router.post('/uploadproduct', bodyParser.json({ limit: '50mb' }), async (req, res) => {
    const mysqlTimestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    const productid = uuidv4();
    const specid = uuidv4();
    const productimgid = uuidv4();
    const {
        prodname,
        proddescr,
        brand,
        category,
        modelnr,
        availableqty,
        price,
        color,
        subcolor,
        memory,
        imageone,
        imagetwo,
        imagethree,
        imagefour,
    } = req.body;
    const availablequantity = parseInt(availableqty);

    const INSERT_PRODUCT = `INSERT INTO products (productid, prodname, proddescr, brand, category, modelnr, availableqty, price, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
    const INSERT_PRODUCT_SPEC = `INSERT INTO productspecs (specid, color, subcolor, productmodel, memory) VALUES ($1, $2, $3, $4, $5)`;
    const INSERT_PRODUCT_IMAGE = `INSERT INTO productimages (productimgid, productmodel, imageone, imagetwo, imagethree, imagefour) VALUES ($1, $2, $3, $4, $5, $6)`;

    cloudinary.config(process.env.CLOUDINARY_URL);

    try {
        const [uploadresone, uploadrestwo, uploadresthree, uploadresfour] = await Promise.all([
            cloudinary.uploader.upload(imageone, {
                upload_preset: "l7gdiaso",
                transformation: [
                    {
                      width: 635,
                      height: 866,
                      crop: "scale",
                      aspect_ratio: "635:866"
                    },
                    {
                      width: 635,
                      height: 866,
                      crop: "fill",
                      gravity: "center",
                      background: "transparent"
                    }
                  ],
              }),
              cloudinary.uploader.upload(imagetwo, {
                upload_preset: "l7gdiaso",
                transformation: [
                    {
                      width: 635,
                      height: 866,
                      crop: "scale",
                      aspect_ratio: "635:866"
                    },
                    {
                      width: 635,
                      height: 866,
                      crop: "fill",
                      gravity: "center",
                      background: "transparent"
                    }
                  ],
              }),
              cloudinary.uploader.upload(imagethree, {
                upload_preset: "l7gdiaso",
                transformation: [
                    {
                      width: 635,
                      height: 866,
                      crop: "scale",
                      aspect_ratio: "635:866"
                    },
                    {
                      width: 635,
                      height: 866,
                      crop: "fill",
                      gravity: "center",
                      background: "transparent"
                    }
                  ],
              }),
              cloudinary.uploader.upload(imagefour, {
                upload_preset: "l7gdiaso",
                transformation: [
                    {
                      width: 635,
                      height: 866,
                      crop: "scale",
                      aspect_ratio: "635:866"
                    },
                    {
                      width: 635,
                      height: 866,
                      crop: "fill",
                      gravity: "center",
                      background: "transparent"
                    }
                  ],
              }),
            
        ]).then((result) => {
            return result;
          }).catch((error) => {
            if (error) {
              console.error(error);
                res.status(500).json({ error: 'Something went wrong' });
            }
            });

            



        if (uploadresone && uploadrestwo && uploadresthree && uploadresfour) {
            const firstImage = uploadresone.secure_url;
            const secondImage = uploadrestwo.secure_url;
            const thirdImage = uploadresthree.secure_url;
            const fourthImage = uploadresfour.secure_url;

            await client.query(INSERT_PRODUCT, [
                productid,
                prodname,
                proddescr,
                (brand).toLowerCase(),
                (category).toLowerCase(),
                modelnr,
                availablequantity,
                price,
                mysqlTimestamp,
            ]);
            await client.query(INSERT_PRODUCT_SPEC, [specid, color, subcolor, modelnr, memory]);
            await client.query(INSERT_PRODUCT_IMAGE, [
                productimgid,
                modelnr,
                firstImage,
                secondImage,
                thirdImage,
                fourthImage,
            ]);
            res.status(200).json({ message: 'Product created successfully'});
        } else {
            res.status(500).json({ error: 'Something went wrong' });
            return;
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
        return;
    }
})







//create a route that will delete a particular product
// router.delete('/deleteproduct/:productid', async (req, res) => {
//     const productid = req.params.productid;
//     const DELETE_PRODUCT = `DELETE FROM products WHERE productid = $1`;


module.exports = router;