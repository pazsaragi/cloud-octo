import React from "react";
import Link from "next/link";

const HomePage = () => {
  return (
    <div>
      <nav>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
      </nav>
      <h1>Cloud Octo</h1>
    </div>
  );
};

export default HomePage;
