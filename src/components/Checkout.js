import { CreditCard, Delete } from "@mui/icons-material";
import {
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import Cart, { getTotalCartValue, generateCartItemsFrom } from "./Cart";
import "./Checkout.css";
import Footer from "./Footer";
import Header from "./Header";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 *
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 *
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} productId - Unique ID for the product
 */

/**
 * @typedef {Object} Address - Data on added address
 *
 * @property {string} _id - Unique ID for the address
 * @property {string} address - Full address string
 */

/**
 * @typedef {Object} Addresses - Data on all added addresses
 *
 * @property {Array.<Address>} all - Data on all added addresses
 * @property {string} selected - Id of the currently selected address
 */

/**
 * @typedef {Object} NewAddress - Data on the new address being typed
 *
 * @property { Boolean } isAddingNewAddress - If a new address is being added
 * @property { String} value - Latest value of the address being typed
 */

// TODO: CRIO_TASK_MODULE_CHECKOUT - Should allow to type a new address in the text field and add the new address or cancel adding new address
/**
 * Returns the complete data on all products in cartData by searching in productsData
 *
 * @param { String } token
 * @param { NewAddress } newAddress
 * @param { Function } handleNewAddress
 * @param { Function } addAddress
 * @returns { JSX.Element }
 */
const AddNewAddressView = ({
  token,
  newAddress,
  handleNewAddress,
  addAddress,
}) => {
  return (
    <Box display="flex" flexDirection="column">
      <TextField
        multiline
        minRows={4}
        placeholder="Enter your complete address"
        value={newAddress.value}
        onChange={(e) => {
          handleNewAddress({ ...newAddress, value: e.target.value });
        }}
      />
      <Stack direction="row" my="1rem" spacing={2}>
        <Button
          variant="contained"
          onClick={async () => await addAddress(token, newAddress)}
          disabled={!newAddress.value.trim()}
        >
          Add
        </Button>
        <Button
          variant="text"
          onClick={() => {
            handleNewAddress({
              ...newAddress,
              isAddingNewAddress: false,
              value: "",
            });
          }}
        >
          Cancel
        </Button>
      </Stack>
    </Box>
  );
};

const Checkout = () => {
  const token = localStorage.getItem("token");
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [addresses, setAddresses] = useState({ all: [], selected: "" });
  const [newAddress, setNewAddress] = useState({
    isAddingNewAddress: false,
    value: "",
  });

  // Fetch the entire products list
  const getProducts = async () => {
    try {
      const response = await axios.get(`${config.endpoint}/products`);
      setProducts(response.data);
      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 500) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
        return null;
      } else {
        enqueueSnackbar(
          "Could not fetch products. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
        return null;
      }
    }
  };

  // Fetch cart data
  const fetchCart = async (token) => {
    if (!token) return null;
    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
        { variant: "error" }
      );
      return null;
    }
  };

  /**
   * Fetch list of addresses for a user
   * API Endpoint - "GET /user/addresses"
   */
  const getAddresses = async (token) => {
    if (!token) return null;
    try {
      const response = await axios.get(`${config.endpoint}/user/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses((curr) => ({ ...curr, all: response.data }));
      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch addresses. Check that the backend is running, reachable and returns valid JSON.",
        { variant: "error" }
      );
      return null;
    }
  };

  /**
   * Add address
   * API Endpoint - "POST /user/addresses"
   */
  const addAddress = async (token, newAddress) => {
    try {
      const response = await axios.post(
        `${config.endpoint}/user/addresses`,
        { address: newAddress.value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddresses((prev) => ({ ...prev, all: response.data }));
      setNewAddress({ isAddingNewAddress: false, value: "" });
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not add this address. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
    }
  };

  /**
   * Delete address
   * API Endpoint - "DELETE /user/addresses/:addressId"
   */
  const deleteAddress = async (token, addressId) => {
    try {
      const response = await axios.delete(
        `${config.endpoint}/user/addresses/${addressId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddresses((prev) => {
        const nextAll = response.data;
        const nextSelected =
          prev.selected === addressId ? "" : prev.selected;
        return { ...prev, all: nextAll, selected: nextSelected };
      });
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not delete this address. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
    }
  };

  // TODO: CRIO_TASK_MODULE_CHECKOUT - Validate request for checkout
  const validateRequest = (items, addresses) => {
    const cartTotal = getTotalCartValue(items);
    const balance = Number(localStorage.getItem("balance") || 0);

    if (cartTotal > balance) {
      enqueueSnackbar(
        "You do not have enough balance in your wallet for this purchase",
        { variant: "warning" }
      );
      return false;
    }
    if (!addresses.all.length) {
      enqueueSnackbar("Please add a new address before proceeding.", {
        variant: "warning",
      });
      return false;
    }
    if (!addresses.selected.length) {
      enqueueSnackbar("Please select one shipping address to proceed.", {
        variant: "warning",
      });
      return false;
    }
    return true;
  };

  // TODO: CRIO_TASK_MODULE_CHECKOUT - Perform checkout
  const performCheckout = async (token, items, addresses) => {
    if (!validateRequest(items, addresses)) return;

    try {
      await axios.post(
        `${config.endpoint}/cart/checkout`,
        { addressId: addresses.selected },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      enqueueSnackbar("Order placed successfully", { variant: "success" });

      const newBalance =
        Number(localStorage.getItem("balance") || 0) -
        getTotalCartValue(items);

      localStorage.setItem("balance", String(newBalance));
      history.push("/thanks");
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar("Oops..Something went wrong!", {
          variant: "error",
        });
      }
    }
  };

  // Fetch products and cart data on page load
  useEffect(() => {
    const onLoadHandler = async () => {
      const productsData = await getProducts();
      const cartData = await fetchCart(token);

      if (productsData && cartData) {
        const cartDetails = await generateCartItemsFrom(
          cartData,
          productsData
        );
        setItems(cartDetails);
      }
    };
    onLoadHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch addresses or redirect if not logged in
  useEffect(() => {
    if (!token) {
      enqueueSnackbar("You must be logged in to access checkout page", {
        variant: "info",
      });
      history.push("/login");
    } else {
      getAddresses(token);
    }
    // it's okay to leave deps minimal here for this page-load flow
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <>
      <Header />
      <Grid container>
        <Grid item xs={12} md={9}>
          <Box className="shipping-container" minHeight="100vh">
            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Shipping
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Manage all the shipping addresses you want. This way you won't
              have to enter the shipping address manually with every order.
              Select the address you want to get your order delivered.
            </Typography>
            <Divider />
            <Box>
              {/* Address List */}
              {addresses.all.length ? (
                addresses.all.map((address) => (
                  <Box
                    key={address._id}
                    onClick={() => {
                      setAddresses({
                        ...addresses,
                        selected: address._id,
                      });
                    }}
                    className={
                      addresses.selected === address._id
                        ? "address-item selected"
                        : "address-item not-selected"
                    }
                  >
                    <Typography>{address.address}</Typography>
                    <Button
                      startIcon={<Delete />}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAddress(token, address._id);
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
                ))
              ) : (
                <Typography my="1rem">
                  No addresses found for this account. Please add one to proceed
                </Typography>
              )}
            </Box>

            {/* Add new address */}
            {!newAddress.isAddingNewAddress && (
              <Button
                color="primary"
                variant="contained"
                id="add-new-btn"
                size="large"
                onClick={() => {
                  setNewAddress((curr) => ({
                    ...curr,
                    isAddingNewAddress: true,
                  }));
                }}
              >
                Add new address
              </Button>
            )}
            {newAddress.isAddingNewAddress && (
              <AddNewAddressView
                token={token}
                newAddress={newAddress}
                handleNewAddress={setNewAddress}
                addAddress={addAddress}
              />
            )}

            {/* Payment */}
            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Payment
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Payment Method
            </Typography>
            <Divider />

            <Box my="1rem">
              <Typography>Wallet</Typography>
              <Typography>
                Pay {`$${getTotalCartValue(items)}`} of available $
                {localStorage.getItem("balance")}
              </Typography>
            </Box>

            <Button
              startIcon={<CreditCard />}
              variant="contained"
              onClick={() => performCheckout(token, items, addresses)}
            >
              PLACE ORDER
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={3} bgcolor="#E9F5E1">
          <Cart isReadOnly products={products} items={items} />
        </Grid>
      </Grid>
      <Footer />
    </>
  );
};

export default Checkout;
