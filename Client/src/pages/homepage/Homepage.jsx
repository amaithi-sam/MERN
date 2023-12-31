import { useEffect, useState } from "react";
import Header from "../../components/header/Header";
import Posts from "../../components/posts/Posts";
import Sidebar from "../../components/sidebar/Sidebar";
import "./homepage.css";
import axios from "axios";
import { useLocation } from "react-router";



export default function Home() {


  const [posts, setPosts] = useState([]);
  const { search } = useLocation();

  //------------------------------------------------------
  //          GETTING ALL PUBLISHED ARTICLES
  //------------------------------------------------------
  useEffect(() => {
    const fetchPosts = async () => {
      const res = await axios.get("/articles" + search);
      setPosts(res.data);
    };
    fetchPosts();
  }, [search]);

  //------------------------------------------------------
  //          RETURN BLOCK - Passing the Articke list to POSTS Component
  //------------------------------------------------------
  return (
    <>
      <Header />
      <div className="home">
        <Posts posts={posts} />
        <Sidebar />
      </div>
    </>
  );
}
