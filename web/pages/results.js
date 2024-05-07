import Layout from "../components/Layout";
import { useEffect, useState } from "react";

export default function Results() {
  return (
    <Layout title={"results"}>
      <h1 className="text-5xl text-center font-bold">Results of Experiment</h1>
      <div className="flex justify-center items-center">
        <img
          src={`http://${process.env.NEXT_PUBLIC_BASE_URL}:5000/api/getSessions/plot`}
          alt="Chart"
        />
      </div>
    </Layout>
  );
}
