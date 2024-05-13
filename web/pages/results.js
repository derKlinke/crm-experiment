import Layout from "../components/Layout";
import {useEffect, useState} from "react";

export default function Results() {
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        fetch(`http://${process.env.NEXT_PUBLIC_BASE_URL}:5000/api/getSessions`)
            .then(response => response.json())
            .then(data => setSessions(data))
            .catch(error => console.error("Error:", error));
    }, []);

    return (
        <Layout title={"results"}>
            <h1 className="text-5xl text-center font-bold">Results of Experiment</h1>
            <div className="flex justify-center items-center">
                <img
                    src={`http://${process.env.NEXT_PUBLIC_BASE_URL}:5000/api/getSessions/plot`}
                    alt="Chart"
                />
            </div>

            <div>
                <table className="table-auto">
                    <thead>
                    <tr>
                        <th className="px-4 py-2">ID</th>
                        <th className="px-4 py-2">Points</th>
                        <th className="px-4 py-2">Time</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sessions.map((session) => (
                        <tr key={session.id}>
                            <td className="border px-4 py-2">{session.id}</td>
                            <td className="border px-4 py-2">{session.points}</td>
                            <td className="border px-4 py-2">{session.created_at}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
}
