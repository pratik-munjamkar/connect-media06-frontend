import "./posts.css";
import { useState, useRef, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import { FaRegHeart, FaHeart, FaRegComment, FaEdit } from "react-icons/fa";
import { Link, useHistory } from "react-router-dom";
import { AiFillDelete, AiOutlineDelete } from "react-icons/ai";
import moment from "moment";
import axios from "axios";

import { useFormik } from 'formik';
import * as Yup from "yup";
import { toast } from "react-toastify";

export default function Posts({ post, setPosts, posts, user, setIsLoading }) {

    const history = useHistory();
    const [isLiked, setIsLiked] = useState(false);
    const commentInput = useRef(null);
    const controllersDiv = useRef(null);
    const token = localStorage.getItem("token");

    const initialValues = {
        commentBox: "",
    };

    const validationSchema = Yup.object({
        commentBox: Yup.string()
            .max(100, "maximum 100 characters")
            .required("Comment cannot be empty")

    });

    useEffect(() => {
        post?.likes?.forEach(l => {
            if (l._id === user?._id) {
                setIsLiked(true);
            }
        })
    }, [post, user?._id]);

    const [showLikes, setLikesShow] = useState(false);
    const handleLikesClose = () => setLikesShow(false);
    const handleLikesShow = () => setLikesShow(true);

    const [showDeleteComment, setShowDeleteComment] = useState(false);
    const [commentIdToDelete, setCommentIdToDelete] = useState();
    const handleCommentDeleteClose = () => setShowDeleteComment(false);
    const handleCommentDeleteShow = (id) => {
        setShowDeleteComment(true);
        setCommentIdToDelete(id);
    }

    const handleCommentDelete = () => {
        handleCommentDeleteOperation(commentIdToDelete, post?._id);
        handleCommentDeleteClose();
        controllersDiv.current.scrollIntoView();
    }

    const onSubmit = async ({ commentBox }) => {
        try {

            setIsLoading(true);

            const { data } = await axios.post(`/comments/add/${post?._id}`, { commentText: commentBox },
                {
                    headers: { token }
                });

            post?.comments?.push({ comment: commentBox, _id: data._id, commentBy: { _id: user?._id, userName: user.userName } });

            setPosts(posts.filter(p => p._id === post?._id ? post : p));
            setIsLoading(false);
        }
        catch (err) {
            setIsLoading(false);
            toast.error("Error posting comment. Try again later");
            console.log(err);
        }
    };

    const formik = useFormik({
        initialValues,
        onSubmit,
        validationSchema
    });

    //redirect to viewposts delete or update post operation
    const handleRedirect = (endpoint) => {
        history.push(`/posts/${post?._id}/${endpoint}`);
    }

    //api call to like a post 
    const likeHandler = async () => {
        try {
            setIsLoading(true);
            await axios.put(`/posts/like/${post?._id}`, { isLiked: !isLiked },
                {
                    headers: { token }
                });

            setIsLiked(!isLiked);

            if (!isLiked) {
                post.likes.push({ _id: user?._id, userName: user?.userName, profilePicture: user?.profilePicture });
            }
            else {
                post.likes = post?.likes.filter(l => l._id !== user?._id);
            }
            setPosts(posts.filter(p => p._id === post?._id ? post : p));

            setIsLoading(false);
        }
        catch (err) {
            setIsLoading(false);
            toast.error("Couldnt like/unlike post?. Try again later");
            console.log(err);
        }
    }

    //api call to delete a comment 
    const handleCommentDeleteOperation = async () => {
        try {

            setIsLoading(true);

            await axios.delete(`/comments/delete/${post?._id}/${commentIdToDelete}`,
                {
                    headers: { token }
                });

            post.comments = post?.comments?.filter(c => c._id !== commentIdToDelete);

            setPosts(posts.map(p => p._id === post?._id ? post : p));

            setIsLoading(false);

        }
        catch (err) {
            setIsLoading(false);
            toast.error("Error deleting comment. Try again later");
            console.log(err);
        }
    }

    return (
        <div className="posts" >
            <Modal show={showLikes} onHide={handleLikesClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Likes</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="likesListDiv">
                        <ul className="likesList">
                            {
                                post?.likes?.map(l => {
                                    return <li key={l?._id} className="likesListItem">
                                        <span className="likesListItemLeft">
                                            <img src={l?.profilePicture} alt="profilepic" className="likesPic" />
                                            <span className="likeName">{l?.userName}</span>
                                        </span>
                                    </li>
                                })
                            }
                        </ul>
                    </div>
                </Modal.Body>
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
                    <Button variant="danger" onClick={handleCommentDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
            <div className="postsWrapper">
                <div className="postsTop">
                    <div className="postTopLeft">
                        <img
                            src={post?.postedBy?.profilePicture}
                            alt="profilePicture" className="postProfileImg" />
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
                <div className="postsCenter">
                    <img ref={controllersDiv} src={post?.photo} alt="photoImg" className="postImg"
                        onClick={() => history.push(`/posts/${post?._id}`)}
                    />
                </div>
                <div className="postBottom">
                    <div className="postBottomTop">
                        <p className="viewPostCommentPara" >
                            {isLiked ? <FaHeart style={{ color: "red" }} className="viewPostlikeIcon"
                                onClick={likeHandler} /> : <FaRegHeart onClick={likeHandler} className="viewPostlikeIcon" />}
                            <FaRegComment className="viewPostcommentIcon" onClick={() => {
                                commentInput.current.focus();
                            }} />
                            {
                                user?._id === post?.postedBy?._id ?
                                    <>
                                        <AiOutlineDelete className="viewPostDeleteIcon"
                                            onClick={() => handleRedirect("delete")}
                                        />
                                        <FaEdit className="viewPostEditIcon"
                                            onClick={() => handleRedirect("edit")}
                                        />
                                    </> :
                                    null
                            }
                        </p>
                        <span onClick={handleLikesShow} className="viewPostLikeCounter">
                            <span className="PostLikeCount">
                                {post?.likes?.length}
                            </span>  people like it</span>
                        <p className="captionP" >
                            <span className="postUsernameBold">
                                {post?.postedBy?.userName}
                            </span>
                            <span className="postText">{post?.caption}</span>
                        </p>
                        <p className="viewPostCommentTextp">{post?.comments?.length} comments</p>
                    </div>
                    <div className="postBottomBottom">
                        <div className="viewPostCommentsList">
                            {
                                post?.comments?.slice(-3).map((c) => {
                                    return <p key={c._id} className="PostCommentPara">
                                        <span className="viewPostUsernameBold">
                                            {c?.commentBy?.userName}
                                        </span>
                                        <span className="viewPostText">{c?.comment}</span>
                                        {
                                            c?.commentBy?._id === user?._id && <span className="commentDeleteSpan"
                                                onClick={() => handleCommentDeleteShow(c?._id)}>
                                                <AiFillDelete />
                                            </span>
                                        }
                                    </p>
                                })
                            }
                        </div>
                        {
                            post?.comments?.length > 3 && <Link to={`/posts/${post?._id}`}>
                                <span className="postCommentText">view all
                                    <span className="viewPostCommentCount">
                                        {post?.comments?.length}
                                    </span>  comments</span>
                            </Link>
                        }
                        <p className="viewPostDate">{new Date(post?.createdAt).toDateString()}</p>
                        <p className="viewPostDate">{moment(post?.createdAt).fromNow()}</p>
                    </div>
                </div>
                <form onSubmit={formik.handleSubmit} className="viewPostcommentForm">
                    <input placeholder="add a comment..." className="viewPostcommentInput" ref={commentInput}
                        onChange={formik.handleChange} name="commentBox" value={formik.values.commentBox} onBlur={formik.handleBlur}
                    />
                    <Button type="submit" className="postButton"  >Post</Button>
                </form>
                {
                    formik.errors.commentBox && formik.touched.commentBox &&
                    <p className="redError">{formik.errors.commentBox}</p>
                }
            </div>
        </div>
    )
}