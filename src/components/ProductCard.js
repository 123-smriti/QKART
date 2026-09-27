//import { AddShoppingCartOutlined} from "@mui/icons-material";
import {
  Button,
  Card,
  //CardActions,
 CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
    if (!product) return null;
  return (
    <Card className="card">
     <CardMedia component="img" src={product.image} alt={product.name}/>
     <cardcontent>
     <Typography  color= "primary" variant="h5" >{product.name}</Typography>
     <Typography color= "text-secondary" variant="subtitle2" >{product.category}</Typography>
     <Typography  variant="h6" >{`$${product.cost}`}</Typography>
     <Rating name="read-only" value={product.rating} readOnly />
     </cardcontent>
     
     <Button onClick={ handleAddToCart} className="card-button" role="button" variant="contained">
     ADD TO CART
     </Button>
    </Card>
  ); 
};

export default ProductCard;
