import { Container, Alert } from "react-bootstrap";
import "./Home.css";
import Header from "../header/Header";
import Posts from "../posts/Posts";
import Suggesion from "../suggestions/Suggesion";
import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../Loader";

export default function Home() {

    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState({});
    const [posts, setPosts] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [errors, setErrors] = useState(false);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const getData = async () => {
            try {
                setIsLoading(true);

                const { data: user } = await axios.get(`/users/profile`,
                    { headers: { token } });
                setUser(user);

                const { data: suggestions } = await axios.get(`/users/suggestions`,
                    { headers: { token } });
                setSuggestions(suggestions);

                const { data: posts } = await axios.get(`/posts/feed`,
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

    return <div>
        <Header />
        <Loader isLoading={isLoading} error={errors}>
            <Container >

                <div className="homeWrapper">
                    <div className="homeLeft">
                    </div>
                    <div className="homeCenter">
                        {
                            posts?.length === 0 && <Alert className="emptyFeedAlert" >
                                Empty feed! follow people to see their posts...
                            </Alert>
                        }
                        {
                            posts?.map(p => <Posts
                                user={user}
                                key={p._id}
                                post={p}
                                posts={posts}
                                setPosts={setPosts}
                                setIsLoading={setIsLoading}
                            />)
                        }
                    </div>
                    <div className="homeRight">
                        <div className="homeRightTop">
                            <div className="homeRightTopLeft">
                                <img src={user?.profilePicture} alt="profilepic" className="homeProfileImg" />
                            </div>
                            <div className="homeRightTopRight">
                                <p className="homeProfileUsername">{user?.userName}</p>
                                <p className="homeBio" >{user?.fullName}</p>
                            </div>
                        </div>
                        <div className="homeRightBottom">
                            <div className="homeRightBottomTop" >
                                <h5>Suggestions for you</h5>
                            </div>

                            {suggestions?.length === 0 && <Alert variant="danger" className="followedAlert">
                                "No more suggestions. you follow everyone!"
                            </Alert>
                            }
                            <div className="suggestionsForYou">
                                <ul className="suggestionsList">
                                    {
                                        suggestions.map(s =>
                                            <Suggesion
                                                key={s._id}
                                                setIsLoading={setIsLoading}
                                                suggestions={suggestions}
                                                setPosts={setPosts}
                                                setSuggestions={setSuggestions}
                                                suggestion={s} />
                                        )
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </Loader>
    </div>
}