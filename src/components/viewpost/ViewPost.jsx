import "./ViewPost.css";
import { useState, useRef, useEffect } from "react";
import Header from "../header/Header";
import { Button, Container, Modal, Form } from "react-bootstrap";
import { FaRegHeart, FaHeart, FaRegComment, FaLongArrowAltLeft, FaEdit } from "react-icons/fa";
import { AiOutlineDelete, AiFillDelete } from "react-icons/ai";
import { useHistory, useParams } from "react-router";
import axios from "axios";
import moment from "moment";
import Loader from "../Loader";

import { useFormik } from 'formik';
import * as Yup from "yup";

import { toast } from 'react-toastify';

export default function ViewPost() {

    const params = useParams();
    const history = useHistory()
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState();
    const [user, setUser] = useState();
    const token = localStorage.getItem("token");

    const [post, setPost] = useState([]);
    const [isLiked, setIsLiked] = useState(false);
    const commentInput = useRef();
    const scrollRef = useRef();

    const [showDelete, setDeleteShow] = useState(false);
    const [showUpdate, setUpdateShow] = useState(false);
    const [showLikes, setLikesShow] = useState(false);
    const [showDeleteComment, setShowDeleteComment] = useState(false);

    const handleDeleteClose = () => setDeleteShow(false);
    const handleDeleteShow = () => setDeleteShow(true);

    const handleUpdateClose = () => setUpdateShow(false);
    const handleUpdateShow = () => setUpdateShow(true);

    const handleLikesClose = () => setLikesShow(false);
    const handleLikesShow = () => setLikesShow(true);

    const [commentIdToDelete, setCommentIdToDelete] = useState();
    const handleCommentDeleteClose = () => setShowDeleteComment(false);
    const handleCommentDeleteShow = (id) => {
        setShowDeleteComment(true);
        setCommentIdToDelete(id);
    }

    useEffect(() => {
        scrollRef.current?.scrollIntoView(false);
    }, [post]);

    //form handling for edit post form
    const formikEdit = useFormik({
        initialValues: { caption: post?.caption || "", location: post?.location || "" },
        onSubmit: async ({ caption, location }) => {
            try {
                setIsLoading(true);
                const body = {};
                body.caption = caption;
                body.location = location;
                const { data } = await axios.put(`/posts/update/${params.id}`, body,
                    {
                        headers: { "token": localStorage.getItem("token") }
                    });
                handleUpdateClose();
                setPost(data);
                setIsLoading(false);
            }
            catch (err) {
                setIsLoading(false);
                handleUpdateClose();
                toast.error("Error updating. Try again later");
                console.log(err);
            }

        },
        validationSchema: Yup.object({
            caption: Yup.string()
                .max(100, "maximum 100 characters"),
            location: Yup.string()
                .max(30, "maximum 30 characters")
        }),
        enableReinitialize: true
    });

    //form handling for comment form
    const formikComment = useFormik({
        initialValues: { commentBox: "" },
        onSubmit: async ({ commentBox }) => {
            try {

                setIsLoading(true);

                const { data } = await axios.post(`/comments/add/${post?._id}`, { commentText: commentBox },
                    {
                        headers: { token }
                    });

                const newPost = post;

                newPost?.comments?.push({ comment: commentBox, _id: data._id, commentBy: { _id: user?._id, userName: user?.userName } });
                formikComment.resetForm();
                setIsLoading(false);
                setPost(newPost);
                scrollRef.current.scrollIntoView({ behavior: "smooth" });
            }
            catch (err) {
                setIsLoading(false);
                toast.error("Error posting comment. Try again later");
                console.log(err);
            }
        },
        validationSchema: Yup.object({
            commentBox: Yup.string()
                .max(100, "maximum 100 characters")
                .required("Comment cannot be empty")

        })
    });

    //api call to like a post 
    const likeHandler = async () => {
        try {
            setIsLoading(true);
            await axios.put(`/posts/like/${post?._id}`, { isLiked: !isLiked },
                {
                    headers: { token }
                });

            setIsLiked(!isLiked);

            const updatedPost = post;

            if (!isLiked) {
                updatedPost.likes.push({ _id: user?._id, userName: user?.userName, profilePicture: user?.profilePicture });
            }
            else {
                updatedPost.likes = post?.likes.filter(l => l._id !== user?._id);
            }

            setPost({ ...updatedPost });

            setIsLoading(false);
        }
        catch (err) {
            setIsLoading(false);
            toast.error("Couldnt like/unlike post. Try again later");
            console.log(err);
        }
    }

    // api call to delete a post
    const handleDelete = async () => {

        try {
            setIsLoading(true);
            await axios.delete(`/posts/delete/${params.id}`,
                { headers: { "token": localStorage.getItem("token") } }
            );
            setIsLoading(false);
            history.push("/");
        }
        catch (err) {
            setIsLoading(false);
            handleDeleteClose();
            toast.error("Couldnt delete post. Try again later");
            console.log(err);
        }

    }

    useEffect(() => {

        //api call to get user info
        const getData = async () => {
            try {
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

    // api call to get the post
    useEffect(() => {

        const getPost = async () => {

            try {
                setIsLoading(true);

                const { data } = await axios.get(`/posts/${params.id}`, {
                    headers: { "token": localStorage.getItem("token") }
                });

                setPost(data);

                if (data.likes.find(l => l._id === user?._id)) setIsLiked(true);

                setIsLoading(false);

                if (params.op) {
                    params.op === "edit" ? handleUpdateShow() : handleDeleteShow();
                }

            }
            catch (err) {
                setIsLoading(false);
                console.log(err);
                setError(true);
            }
        }

        getPost();

    }, [params.id, params.op, user]);




    //api call to delete a comment 
    const handleCommentDeleteOperation = async () => {
        try {
            setIsLoading(true);
            await axios.delete(`/comments/delete/${post._id}/${commentIdToDelete}`,
                {
                    headers: { token }
                });

            const newPost = post;
            newPost.comments = newPost.comments.filter(c => c._id !== commentIdToDelete);
            setPost(newPost);
            setIsLoading(false);
            handleCommentDeleteClose();
            toast.success("Deleted comment successfully");
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
        catch (err) {
            setIsLoading(false);
            toast.error("Error deleting comment. Try again later");
            console.log(err);
            handleCommentDeleteClose();

        }
    }

    return <>
        <Header />
        <Loader isLoading={isLoading} error={error}>

            <Container className="viewPostContainer">
                <div className="followingListLeft">
                    <button className="backArrowButton" onClick={() => { history.goBack() }}><FaLongArrowAltLeft className="backArrowIcon" /></button>
                </div>

                <Modal
                    size="lg"
                    show={showUpdate}
                    onHide={() => handleUpdateClose(false)}
                    aria-labelledby="example-modal-sizes-title-lg"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Edit post
                        </Modal.Title>

                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={formikEdit.handleSubmit} >

                            <Form.Group className="mb-3" controlId="formBasicPassword">
                                <Form.Label>Caption</Form.Label>
                                <Form.Control type="text" name="caption" value={formikEdit.values.caption}
                                    onChange={formikEdit.handleChange} onBlur={formikEdit.handleBlur} />
                                {
                                    formikEdit.errors.caption && formikEdit.touched.caption ?
                                        <Form.Text className="red">
                                            {formikEdit.errors.caption}
                                        </Form.Text> : null
                                }
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formBasicPassword">
                                <Form.Label>Location</Form.Label>
                                <Form.Control type="text" name="location" value={formikEdit.values.location}
                                    onChange={formikEdit.handleChange} onBlur={formikEdit.handleBlur} />
                                {
                                    formikEdit.errors.location && formikEdit.touched.location ?
                                        <Form.Text className="red">
                                            {formikEdit.errors.location}
                                        </Form.Text> : null
                                }
                            </Form.Group>

                            <Button variant="primary" className="postButton" type="submit">
                                Submit
                            </Button>

                        </Form>
                    </Modal.Body>
                </Modal>

                <Modal show={showDelete} onHide={handleDeleteClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Deleting post?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Are you sure you want to permanently delete this post? </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleDeleteClose}>
                            Close
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal show={showDeleteComment} onHide={handleCommentDeleteClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Deleting comment?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Are you sure you want to permanently delete this comment? </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCommentDeleteClose}>
                            Close
                        </Button>
                        <Button variant="danger" onClick={handleCommentDeleteOperation}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal show={showLikes} onHide={handleLikesClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Likes</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="likesListDiv">
                            <ul className="likesList">
                                {
                                    post?.likes?.map(f => {
                                        return <li key={f._id} className="likesListItem">
                                            <span className="likesListItemLeft">
                                                <img src={f.profilePicture} alt="profilepic" className="likesPic" />
                                                <span className="likeName">{f.userName}</span>
                                            </span>
                                        </li>
                                    })
                                }
                            </ul>
                        </div>
                    </Modal.Body>
                </Modal>
                <div className="viewPost">
                    <div className="viewPostsWrapper">
                        <div className="viewPostLeft">
                            <img src={post?.photo} alt="viewPostImg" className="viewPostImg" />
                        </div>
                        <div className="viewPostRight">
                            <div className="viewPostTop">
                                <div className="viewPostTopLeft">
                                    <img
                                        src={post?.postedBy?.profilePicture}

                                        alt="" className="viewPostProfileImg" />
                                    <span className="viewPostUsernameContainer">
                                        <p className="viewPostUsername">
                                            {post?.postedBy?.userName}
                                        </p>

                                        <p className="viewPostLocation">
                                            {post?.location}
                                        </p>
                                    </span>
                                </div>
                            </div>
                            <div className="viewPostBottom">
                                <div className="viewPostBottomTop">
                                    <span className="viewPostUsernameBold">
                                        {post?.postedBy?.userName}
                                    </span>
                                    <span className="viewPostText">{post?.caption}</span>
                                </div>
                                <div className="viewPostBottomBottom">
                                    <p className="viewPostCommentTextp">{post?.comments?.length} comments</p>
                                    <div className="viewPostCommentsList" >
                                        {
                                            post?.comments?.map(c => {
                                                return <p ref={scrollRef} key={c._id} className="viewPostCommentPara">
                                                    <span className="viewPostUsernameBold">
                                                        {c?.commentBy?.userName}
                                                    </span>

                                                    <span className="viewPostText">{c.comment}</span>
                                                    {
                                                        c?.commentBy?._id === user?._id ? <span className="commentDeleteSpan"
                                                            onClick={() => handleCommentDeleteShow(c._id)}>
                                                            <AiFillDelete />
                                                        </span> : null
                                                    }
                                                </p>
                                            })
                                        }
                                    </div>
                                    <p className="viewPostCommentPara">
                                        {isLiked ? <FaHeart style={{ color: "red" }} className="viewPostlikeIcon" onClick={likeHandler} /> : <FaRegHeart onClick={likeHandler} className="viewPostlikeIcon" />}

                                        <FaRegComment className="viewPostcommentIcon" onClick={() => {
                                            commentInput.current.focus();
                                        }} />
                                        {
                                            user?._id === post?.postedBy?._id ?
                                                <>
                                                    <AiOutlineDelete className="viewPostDeleteIcon"
                                                        onClick={handleDeleteShow}
                                                    />

                                                    <FaEdit className="viewPostEditIcon"
                                                        onClick={handleUpdateShow}
                                                    />
                                                </> :
                                                null
                                        }
                                    </p>

                                    <span onClick={handleLikesShow} className="viewPostLikeCounter">
                                        <span className="viewPostLikeCount">
                                            {post?.likes?.length}
                                        </span>
                                        people like it</span>
                                    <p className="viewPostDate">{new Date(post?.createdAt).toDateString()}</p>
                                    <p className="viewPostDate">{moment(post?.createdAt).fromNow()}</p>
                                </div>
                            </div>

                            <form onSubmit={formikComment.handleSubmit} className="viewPostcommentForm">
                                <input placeholder="add a comment..." className="viewPostcommentInput" ref={commentInput}
                                    onChange={formikComment.handleChange} name="commentBox" value={formikComment.values.commentBox} onBlur={formikComment.handleBlur}
                                />
                                <Button type="submit" className="postButton"   >Post</Button>
                            </form>
                            {
                                formikComment.errors.commentBox && formikComment.touched.commentBox ?
                                    <p className="redError">{formikComment.errors.commentBox}</p> : null
                            }
                        </div>
                    </div>
                </div>
            </Container>
        </Loader>
    </>
}