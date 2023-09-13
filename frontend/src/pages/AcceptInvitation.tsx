import React from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { PageLoader } from "../components/Auth/page-loader";
import { useAcceptProjectMutation } from "../graphql/generated/graphql";
const AcceptInvitation = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";
    const navigate = useNavigate();

    const [acceptProject, { data, called}] = useAcceptProjectMutation({
        variables: {
            token: token
        },
    });

    console.log("test")

    console.log(searchParams.get("token"))

    React.useEffect(() => {
        if (token && !called) {
            acceptProject({
                variables: {
                    token: token
                }
            }).then(() => {
                navigate("/")
            })
        }
    }, [token, called])

    return (
    <div>
        {data?.acceptProjectInvitation.success}
        {searchParams.get("token")}
        <PageLoader />
    </div>
    )
}

export default AcceptInvitation;