import { Container, Form, Spinner, Button } from "react-bootstrap";
import { Redirect, useParams, useHistory, Link } from "react-router-dom";
import { useFormik } from 'formik';
import * as Yup from "yup";

import axios from "axios";

import { useState } from "react";
import { toast } from "react-toastify";

export default function ResetPassword() {

    const [isLoading, setIsLoading] = useState(false);
    const params = useParams();
    const history = useHistory();

    const initialValues = {
        password: "",
        confirmPassword: ""
    }

    const validationSchema = Yup.object({
        password: Yup.string()
            .required('Required')
            .min(6, "minimum 6 characters")
            .max(100, "maximum 100 characters"),
        confirmPassword: Yup.string()
            .required('Required')
            .oneOf([Yup.ref('password'), null], "Password doesn't match!")
            .min(6, "minimum 6 characters")
            .max(100, "maximum 100 characters")
    });

    const onSubmit = ({ password }) => {

        const uploadToBackend = async () => {
            try {
                setIsLoading(true);
                const randomString = params.jwt;
                await axios.put(`/auth/resetpassword`, {
                    password,
                    randomString
                });

                setIsLoading(false);
                toast.success("Password changed successfully!");
                history.replace("/user/login");

            }
            catch (err) {
                setIsLoading(false);
                toast.error("Error resetting password. Try later");
                console.error(err);
            }
        }

        uploadToBackend();

    };

    const formik = useFormik({
        initialValues,
        onSubmit,
        validationSchema
    });

    return (
        localStorage.getItem("token") ? <Redirect to="/" /> :
            <Container>
                <div className="register">
                    <div className="registerRight">
                        <div className="registerRightTop">
                            <div className="registerLogo">
                                <span>Password-Reset</span>
                            </div>
                            <Form onSubmit={formik.handleSubmit} >

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

                                <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
                                    <Form.Label>Confrim password</Form.Label>
                                    <Form.Control type="password" name="confirmPassword"
                                        value={formik.values.confirmPassword} placeholder="Min 6 characters" onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                    {
                                        formik.errors.confirmPassword && formik.touched.confirmPassword ?
                                            <Form.Text className="red">
                                                {formik.errors.confirmPassword}
                                            </Form.Text> : null
                                    }
                                </Form.Group>

                                <Button variant="primary" type="submit" className="customBtn">
                                    {
                                        isLoading ?
                                            <Spinner animation="border" size="sm" /> :
                                            "Reset Password"
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
                </div>
            </Container>
    )
}