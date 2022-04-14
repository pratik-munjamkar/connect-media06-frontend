import "./PostCard.css";
import { useLocation } from "react-router";

export default function PostCard({ post }) {

    const { pathname } = useLocation();

    return (
        <div className="postCardWrapper">
            {
                pathname === "/explore" ? (<><div className="postsTop">
                    <div className="postTopLeft">
                        <img
                            src={post?.postedBy?.profilePicture}
                            alt="profilepic" className="postProfileImg" />
                        <span className="explorePostUsernameContainer">
                            <p className="explorePostUsername">
                                {post?.postedBy?.userName}
                            </p>
                            <p className="explorePostLocation" >{post?.location}</p>
                        </span>
                    </div>
                </div>
                    <span className="postText">{post?.caption}</span></>) : null
            }

            <div className="postsCenter">
                <img src={post?.photo} alt="postimage" className="postImgProEx" />
            </div>

        </div>
    )
}