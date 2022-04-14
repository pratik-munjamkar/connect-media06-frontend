import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";



export default function Suggesions({ suggestion, suggestions, setSuggestions, setIsLoading, setPosts }) {

    const token = localStorage.getItem("token");

    //api call to follow a user
    const handleFollow = async (id, name) => {
        try {
            setIsLoading(true);
            await axios.put(`/users/follow/${id}`, {}, { headers: { token } });
            setSuggestions(suggestions.filter(s => s._id !== id));

            const { data: posts } = await axios.get(`/posts/feed`,
                { headers: { token } });
            setPosts(posts);
            setIsLoading(false);
            toast.success(`You followed ${name}`);
        }
        catch (err) {
            setIsLoading(false);
            console.log(err);
            toast.error(`error following! try later.`);
        }

    }

    return <li className="suggestionsListItem">
        <span className="suggestionsListItemLeft">
            <img src={suggestion?.profilePicture} alt="profilepic" className="suggestionsPic" />
            <span className="suggestionName">{suggestion?.userName}</span>
        </span>
        <Button variant="outline-primary" className="signBtn"
            onClick={() => handleFollow(suggestion?._id, suggestion?.userName)}>Follow</Button>
    </li>
}