import { Container } from 'react-bootstrap';
import "./Explore.css";
import Header from "../header/Header";
import { Link } from "react-router-dom";
import PostCard from '../postcards/PostCard';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '../Loader';

export default function Explore() {

    const [errors, setErrors] = useState();
    const [isLoading, setIsLoading] = useState();
    const [posts, setPosts] = useState([]);
    const token = localStorage.getItem("token");

    useEffect(() => {

        //api call to get all posts for explore
        const getPosts = async () => {
            try {
                setIsLoading(true);
                const { data } = await axios.get(`/posts/explore`,
                    { headers: { token } });
                setPosts(data);
                setIsLoading(false);
            }
            catch (err) {
                setErrors(true);
                setIsLoading(false);
                console.log(err);
            }
        }

        getPosts();

    }, [token]);

    return <>
        <Header />
        <Loader isLoading={isLoading} error={errors}>
            <Container>
                <div className="explore">
                    {posts?.map(p =>
                        <Link className="postCards" key={p._id} to={`/posts/${p._id}`}>
                            <PostCard post={p} />
                        </Link>
                    )}
                </div>
            </Container>
        </Loader>
    </>
}