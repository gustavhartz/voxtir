import { useParams } from "react-router-dom";
const AcceptInvitation = () => {
    const { token } = useParams();
    return (
        <div>
            {token}
            Accept Invitation
        </div>
    )
}

export default AcceptInvitation;