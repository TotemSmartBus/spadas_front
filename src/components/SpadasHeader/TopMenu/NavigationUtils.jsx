import React from "react";
import { useNavigate } from "react-router-dom";

export const NavigationUtils = () => {
    const navigate = useNavigate()

    const navigateToLogin = () => {
        navigate('/login')
    }

    const navigateToHome = () => {
        navigate('/')
    }

    const navigateToShoppingCart = () => {
        navigate('/shop')
    }

    return {
        navigateToLogin,
        navigateToHome,
        navigateToShoppingCart
    }
}