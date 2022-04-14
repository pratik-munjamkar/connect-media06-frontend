import { Container, Button, Modal, Alert } from 'react-bootstrap';
import "./Profile.css";
import axios from 'axios';
import Header from "../header/Header";
import { NavLink, Link, useHistory } from 'react-router-dom';
import PostCard from '../postcards/PostCard';
import { useState, useEffect, useRef } from 'react';
import { FaRegEdit } from 'react-icons/fa';
import Loader from "../Loader";

import { toast } from 'react-toastify';

export default function Profile() {

    const [user, setUser] = useState({});
    const [posts, setPosts] = useState([]);
    const token = localStorage.getItem("token");
    const history = useHistory();
    const choosePic = useRef(null);

    const [isLoading, setIsLoading] = useState();
    const [errors, setErrors] = useState(false);

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    useEffect(() => {

        //api call to get user info and posts
        const getData = async () => {
            try {
                setIsLoading(true);

                const { data: user } = await axios.get(`/users/profile`,
                    { headers: { token } });
                setUser(user);

                const { data: posts } = await axios.get(`/posts/user`,
                    { headers: { token } });
                setPosts(posts);

                setIsLoading(false);
            }
            catch (err) {
                setIsLoading(false);
                setErrors(true);
                console.log(err);
            }
        }

        getData();

    }, [token]);

    // profile pic posting operation
    const handleChange = ({ target: { files } }) => {

        const formData = new FormData();
        formData.append("file", files[0]);
        formData.append("upload_preset", process.env.REACT_APP_UPLOAD_PRESET);
        formData.append("cloud_name", process.env.REACT_APP_CLOUDNAME);

        // post the image direclty to the cloudinary
        const uploadImageToCloud = async () => {

            try {
                setIsLoading(true);

                const { data } = await axios.post(process.env.REACT_APP_CLOUDINARY_POST_URL, formData);

                const body = {};
                body.profilePicture = data.secure_url;
                body.profilePictureId = data.public_id;

                // save image address to users database
                await axios.put(`/users/editpic`, body,
                    {
                        headers: { token: localStorage.getItem("token") }
                    });

                setUser({ ...user, profilePicture: data.secure_url, profilePictureId: data.public_id });
                setIsLoading(false);
            }
            catch (err) {
                setIsLoading(false);
                console.log(err);
                toast.error("Couldnt upload image. Try later");
            }
        }

        uploadImageToCloud();

    }

    //logout operation
    const logoutOperation = () => {
        localStorage.clear();
        history.replace("/user/login");
    }


    //api call to delete profile pic
    const handleDeleteProfilePic = async () => {
        try {
            setIsLoading(true);
            const body = {};
            body.profilePicture = process.env.REACT_APP_DEFAULT_PROFILE_PIC;
            body.profilePictureId = "";

            // save image address to users database
            await axios.put(`/users/editpic`, body,
                {
                    headers: { token: localStorage.getItem("token") }
                });

            setUser({ ...user, profilePicture: process.env.REACT_APP_DEFAULT_PROFILE_PIC, profilePictureId: "" });

            setIsLoading(false);
        }
        catch (err) {
            setIsLoading(false);
            console.log(err);
            toast.error("Couldnt remove picture. Try later");
        }
    }

    return <>
        <Header />
        <Loader isLoading={isLoading} error={errors}>
            <Container>
                <div className="profileWrapper" >

                    <div className="profileTop">
                        <div className="profileTopLeft">
                            <img src={user?.profilePicture} alt="profile pic" className="profileImg" />
                            <input type="file" className="chooseProPic" ref={choosePic} onChange={handleChange} />
                            <FaRegEdit className="editPicIcon" onClick={() => {
                                handleShow()

                            }} />

                        </div>
                        <div className="profileTopRight">
                            <div className="profileTopRightTop">
                                <span className="profileUsername">{user?.userName}</span>
                                <Link to="profile/edit">
                                    <Button className="profileButtons postButton" >Edit profile</Button>
                                </Link>
                                <div className="logoutDiv">
                                    <Button variant="danger" className="profileButtons"
                                        onClick={logoutOperation}
                                    >Logout</Button>
                                </div>

                            </div>
                            <div className="profileTopRightMiddle">
                                <span >
                                    <span className="profileTopRightMiddleData">{posts?.length}</span> posts
                                </span>
                                <Link to={`/profile/followers/${user?._id}`}>
                                    <span className="userDetailsCountSpan"><span className="profileTopRightMiddleData">{user?.followers?.length}</span> followers</span>
                                </Link>

                                <Link to={`/profile/following/${user?._id}`}>
                                    <span className="userDetailsCountSpan"><span className="profileTopRightMiddleData">{user?.following?.length}</span> following</span>
                                </Link>

                            </div>
                            <div className="profileTopRightBottom">
                                <p className="profilebio" >{user?.fullName}</p>
                                <p>{user?.bio}</p>
                            </div>
                        </div>
                    </div>

                    <div className="profileMiddle">
                        <ul className="profileMiddleList">
                            <li className="profileMiddleListItem">
                                <button className="profileMiddleListItemBtn">Posts</button>
                            </li>
                            <li className="profileMiddleListItem">
                                <button disabled className="profileMiddleListItemBtn">IGTV</button>
                            </li>
                            <li className="profileMiddleListItem">
                                <button disabled className="profileMiddleListItemBtn">Reels</button>
                            </li>
                            <li className="profileMiddleListItem">
                                <button disabled className="profileMiddleListItemBtn">Saved</button>
                            </li>
                            <li className="profileMiddleListItem">
                                <NavLink to="/newpost">
                                    <button className="profileMiddleListItemBtn">New Post</button>
                                </NavLink>

                            </li>
                        </ul>
                    </div>

                    <div className="profileBottom" >
                        {
                            posts?.length === 0 && <Alert variant="primary">
                                You haven't posted anything yet...
                            </Alert>
                        }
                        <div className="profilePostsContainer" >

                            {posts?.map(p =>
                                <Link className="postCards" key={p._id} to={`posts/${p._id}`}>
                                    <PostCard post={p} />
                                </Link>
                            )}

                        </div>
                    </div>

                </div>
                <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit profile picture</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="modalPicButtons">
                            <Button className="postButton" variant="primary"
                                onClick={() => {
                                    handleClose();
                                    choosePic.current.click();

                                }}>
                                Change photo
                            </Button>
                            <Button
                                className={
                                    user?.profilePicture ===
                                        process.env.REACT_APP_DEFAULT_PROFILE_PIC ?
                                        "disabled" : ""}
                                variant="danger"
                                onClick={() => {
                                    handleClose();
                                    handleDeleteProfilePic();
                                }}>
                                Remove photo
                            </Button>
                        </div>
                    </Modal.Body>
                </Modal>
            </Container>
        </Loader>
    </>
}