import { useState } from "react";
import { Container, Form, Button, Spinner, Alert } from "react-bootstrap";
import { Link, Redirect } from "react-router-dom";
import { useFormik } from 'formik';
import * as Yup from "yup";
import axios from "axios";

import "./ForgotPassword.css";
export default function ForgotPassword() {

    const [errors, setErrors] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState(false);

    const initialValues = {
        email: ""
    };

    const validationSchema = Yup.object({
        email: Yup.string()
            .email('Invalid email format')
            .required('Required')
    });

    const onSubmit = ({ email }) => {

        const uploadToBackend = async () => {
            try {
                setIsLoading(true);
                await axios.put(`/auth/forgotpassword`, {
                    email
                });
                setIsLoading(false);
                setSuccessMsg(true);
            }
            catch (err) {
                setIsLoading(false);
                setErrors(err?.response?.data);
                console.log(err);
            }
        }
        uploadToBackend();
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
                    {
                        successMsg ? <div className="registerErrorAlert">
                            <Alert variant="success">
                                Password reset link has been sent to your email.
                            </Alert>
                        </div> : <>
                            <div className="loginRight">
                                <div className="loginRightTop">
                                    <div className="loginLogo">
                                        <span>Forgot-Password</span>
                                    </div>
                                    {
                                        errors ? <div className="registerErrorAlert">
                                            <Alert variant="danger">
                                                {errors}
                                            </Alert>
                                        </div> : null
                                    }
                                    <Form onSubmit={formik.handleSubmit} >
                                        <Form.Group className="mb-3" controlId="formBasicEmail">
                                            <Form.Label>Email address</Form.Label>
                                            <Form.Control type="email" name="email" placeholder="Enter registered email"
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
                                        <Button className="customBtn" variant="primary" type="submit">
                                            {
                                                isLoading ?
                                                    <Spinner animation="border" size="sm" /> :
                                                    "Submit"
                                            }
                                        </Button>
                                    </Form>
                                </div>
                                <div className="loginRightBottom">
                                    <p>Wanna try logging in?
                                        <Link to="/user/login">
                                            <Button className="signBtn" variant="outline-primary">Sign in</Button>
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </>
                    }
                </div>
            </Container>
    )
}