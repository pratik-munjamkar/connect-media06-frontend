import Header from "../header/Header";
import { Container, Form, Button, Spinner } from 'react-bootstrap';
import "./NewPost.css";
import { useState } from "react";
import axios from "axios";
import { useHistory } from "react-router";

import { useFormik } from 'formik';
import * as Yup from "yup";

import { toast } from 'react-toastify';

export default function NewPost() {

    const history = useHistory();

    const [photo, setPhoto] = useState();
    const [isLoading, setIsLoading] = useState();

    const initialValues = {
        caption: "",
        location: "",
    };

    const validationSchema = Yup.object({
        caption: Yup.string()
            .max(100, "maximum 100 characters"),
        location: Yup.string()
            .max(30, "maximum 30 characters")
    });

    const handleChange = ({ target: { files } }) => {

        setPhoto(files[0]);

    }

    const onSubmit = ({ caption, location }) => {

        const formData = new FormData();
        formData.append("file", photo);
        formData.append("upload_preset", process.env.REACT_APP_UPLOAD_PRESET);
        formData.append("cloud_name", process.env.REACT_APP_CLOUDNAME);

        const uploadToBackend = async () => {

            try {

                setIsLoading(true);

                // post the image direclty to the cloudinary
                const { data } = await axios.post(process.env.REACT_APP_CLOUDINARY_POST_URL, formData);

                const body = {};
                body.photo = data.secure_url;
                body.photoId = data.public_id;
                body.caption = caption;
                body.location = location;

                //save new post to db
                await axios.post(`/posts/create`, body,
                    {
                        headers: { token: localStorage.getItem("token") }
                    });
                setIsLoading(false);
                history.replace("/");

            }
            catch (err) {
                setIsLoading(false);
                toast.error("Error posting. Try again later");
                console.log(err);
            }
        }

        if (photo) {
            uploadToBackend();
        }
        else {
            toast.error("Please select a picture to post");
        }
    }

    const formik = useFormik({
        initialValues,
        onSubmit,
        validationSchema
    });

    return <>
        <Header />
        <Container>
            <div className="newPost">
                <h1>Add post</h1>
                <Form onSubmit={formik.handleSubmit} >

                    <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label>Select a picture from computer</Form.Label>
                        <Form.Control type="file" name="file" required onChange={handleChange} />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Caption</Form.Label>
                        <Form.Control type="text" name="caption" value={formik.values.caption}
                            onChange={formik.handleChange} onBlur={formik.handleBlur} />
                        {
                            formik.errors.caption && formik.touched.caption ?
                                <Form.Text className="red">
                                    {formik.errors.caption}
                                </Form.Text> : null
                        }
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Location</Form.Label>
                        <Form.Control type="text" name="location" value={formik.values.location}
                            onChange={formik.handleChange} onBlur={formik.handleBlur} />
                        {
                            formik.errors.location && formik.touched.location ?
                                <Form.Text className="red">
                                    {formik.errors.location}
                                </Form.Text> : null
                        }
                    </Form.Group>

                    <Button variant="primary" type="submit" className="postButton">
                        {
                            isLoading ?
                                <><Spinner animation="border" size="sm" />Submitting...</> :
                                "Submit"
                        }
                    </Button>
                </Form>
            </div>
        </Container>
    </>
}