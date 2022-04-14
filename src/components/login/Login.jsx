import { useState } from "react";
import { Container, Form, Button, Spinner, Alert } from "react-bootstrap";
import { FaHandsHelping } from "react-icons/fa";
import { Link, useHistory, Redirect } from "react-router-dom";
import { useFormik } from 'formik';
import * as Yup from "yup";
import axios from "axios";

import "./Login.css";
export default function Login() {

    const [errors, setErrors] = useState();
    const [isLoading, setIsLoading] = useState(false);

    const history = useHistory();

    const initialValues = {
        email: "pdemo902@gmail.com",
        password: "pdemo902"
    };

    const validationSchema = Yup.object({
        email: Yup.string()
            .email('Invalid email format')
            .required('Required'),
        password: Yup.string()
            .required('Required')
            .min(6, "minimum 6 characters")
            .max(100, "maximum 100 characters")
    });

    const onSubmit = ({ email, password }) => {

        const postData = async () => {
            try {
                setIsLoading(true);
                const { data: { userinfo, token } } = await axios.post(`/auth/login`, {
                    email,
                    password
                });
                setIsLoading(false);

                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(userinfo));
                history.replace("/");
            }
            catch (err) {
                setIsLoading(false);
                setErrors(err?.response?.data);
                console.log(err);
            }
        }

        postData();

    }

    const formik = useFormik({
        initialValues,
        onSubmit,
        validationSchema
    });

    return (

        localStorage.getItem("token") ? <Redirect to="/" /> :
            <Container>
                <div className="login">
                    <div className="loginRight">
                        <div className="loginRightTop">
                            <div className="loginLogo">
                                <FaHandsHelping /><span>CONNECT-LOGIN</span>
                            </div>
                            {
                                errors &&
                                <Alert variant="danger" className="alignCenter">
                                    {errors}
                                </Alert>
                            }
                            <Form onSubmit={formik.handleSubmit} >
                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <Form.Label>Email address</Form.Label>
                                    <Form.Control type="email" name="email" placeholder="Enter email"
                                        onChange={formik.handleChange} value={formik.values.email}
                                        onBlur={formik.handleBlur}
                                    />
                                    {
                                        formik.errors.email && formik.touched.email ?
                                            <Form.Text className="red">
                                                {formik.errors.email}
                                            </Form.Text> : null
                                    }
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formBasicPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" name="password"
                                        value={formik.values.password} placeholder="Min 6 characters" onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                    {
                                        formik.errors.password && formik.touched.password ?
                                            <Form.Text className="red">
                                                {formik.errors.password}
                                            </Form.Text> : null
                                    }
                                </Form.Group>
                                <Button type="submit" className="customBtn">
                                    {
                                        isLoading ?
                                            <Spinner animation="border" size="sm" /> :
                                            "Sign in"
                                    }
                                </Button>

                                <Link to="/user/forgotpassword">
                                    <Button className="signBtn w-100" variant="outline-primary">Forgot password?</Button>
                                </Link>
                            </Form>
                        </div>
                        <div className="loginRightBottom">
                            <p>Dont have an account?
                                <Link to="/user/register">
                                    <Button className="signBtn" variant="outline-primary">Signup</Button>
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </Container>
    )
}