import { useProjectsQuery } from "../graphql/generated/graphql";
const Projects = () => {
    const { data } = useProjectsQuery();
    return (
        <div className="px-6 py-4">
            Projects Page
            {JSON.stringify(data)}
        </div>
    )
}

export default Projects;