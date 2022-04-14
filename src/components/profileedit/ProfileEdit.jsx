import { Container, Form, Button, Alert, Modal } from 'react-bootstrap';
import Header from "../header/Header";
import "./ProfileEdit.css";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router';
import { FaLongArrowAltLeft } from 'react-icons/fa';
import { useFormik } from 'formik';
import * as Yup from "yup";

import { toast } from 'react-toastify';
import Loader from '../Loader';

export default function ProfileEdit() {

    const [user, setUser] = useState();
    const [error, setError] = useState();
    const [isLoading, setIsLoading] = useState();
    const token = localStorage.getItem("token");
    const [showDelete, setDeleteShow] = useState(false);

    const handleDeleteClose = () => setDeleteShow(false);
    const handleDeleteShow = () => setDeleteShow(true);

    const history = useHistory();

    const initialValues = {
        fullName: user?.fullName || "",
        userName: user?.userName || "",
        bio: user?.bio || ""
    };

    const validationSchema = Yup.object({
        fullName: Yup.string()
            .min(4, "minimum 4 characters")
            .max(50, "maximum 50 characters"),
        userName: Yup.string()
            .min(3, "minimum 3 characters")
            .max(12, "maximum 12 characters"),
        bio: Yup.string()
            .max(50, "maximum 50 characters")
    });

    useEffect(() => {

        //api call to get user info
        const getData = async () => {
            try {
                setIsLoading(true);
                const { data: user } = await axios.get(`/users/profile`,
                    { headers: { token } });
                setUser(user);

                setIsLoading(false);
            }
            catch (err) {
                setIsLoading(false);
                setError(true);
                console.log(err);
            }
        }

        getData();

    }, [token]);

    const onSubmit = ({ fullName, bio, userName }) => {

        // api call to update user
        const uploadToBackend = async () => {
            try {

                setIsLoading(true);

                await axios.put(`/users/edit`, { fullName, bio, userName },
                    {
                        headers: { token }
                    });
                history.replace("/profile");
            }
            catch (err) {
                setIsLoading(false);
                toast.error(err?.response?.data || "Couldnt update user");
                console.log(err);
            }
        }

        uploadToBackend();

    }

    const formik = useFormik({
        initialValues,
        onSubmit,
        validationSchema,
        enableReinitialize: true
    });

    // api call to delete user completely from database
    const handleDelete = async () => {

        try {
            setIsLoading(true);
            await axios.delete(`/users/delete`,
                { headers: { token } }
            );

            localStorage.clear();

            setIsLoading(false);

            history.replace("/user/login");
        }
        catch (err) {
            setIsLoading(false);
            handleDeleteClose();
            toast.error("Error deleting account. Try again later");
            console.log(err);
        }
    }

    return <>
        <Header />
        <Loader isLoading={isLoading} error={error}>
            <Container>
                <Modal show={showDelete} onHide={handleDeleteClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Deleting account?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Are you sure you want to permanently delete your account?</p>
                        <p>Your posts, likes, comments and all data will be automatically deleted permanently.</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleDeleteClose}>
                            Close
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>
                <div className="profileedit">
                    {error && <Alert variant="danger" className="followedAlert">
                        {error}
                    </Alert>}
                    <button className="backArrowButton" onClick={() => { history.goBack() }}><FaLongArrowAltLeft className="backArrowIcon" /></button>
                    <div className="profileEditTopFlex">
                        <h1>Edit profile</h1>
                        <Button variant="danger" type="button" onClick={handleDeleteShow}>
                            Delete account
                        </Button>
                    </div>

                    <Form onSubmit={formik.handleSubmit} >

                        <Form.Group className="mb-3" controlId="formBasicText">
                            <Form.Label>Full name</Form.Label>
                            <Form.Control type="text" name="fullName"
                                value={formik.values.fullName} placeholder="Enter full name"
                                onChange={formik.handleChange} onBlur={formik.handleBlur} />
                            {
                                formik.errors.fullName && formik.touched.fullName ?
                                    <Form.Text className="red">
                                        {formik.errors.fullName}
                                    </Form.Text> : null
                            }

                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicUn">
                            <Form.Label>User name</Form.Label>
                            <Form.Control type="text" name="userName"
                                value={formik.values.userName} placeholder="Enter user name"
                                onChange={formik.handleChange} onBlur={formik.handleBlur} />
                            {
                                formik.errors.userName && formik.touched.userName ?
                                    <Form.Text className="red">
                                        {formik.errors.userName}
                                    </Form.Text> : null
                            }
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicBio">
                            <Form.Label>Bio</Form.Label>
                            <Form.Control type="text" name="bio" value={formik.values.bio}
                                placeholder="tell something about yourself..."
                                onChange={formik.handleChange} onBlur={formik.handleBlur}
                            />
                            {
                                formik.errors.bio && formik.touched.bio ?
                                    <Form.Text className="red">
                                        {formik.errors.bio}
                                    </Form.Text> : null
                            }
                        </Form.Group>
                        <Button variant="primary" type="submit"
                            className={formik.values.fullName || formik.values.userName || formik.values.bio ? "postButton" : "disabled postButton"}>
                            Submit
                        </Button>
                    </Form>
                </div>
            </Container>
        </Loader>
    </>
}