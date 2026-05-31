import './TaskSkeleton.css'

export const TaskSkeleton = () => (
    <ul className="task-skeleton-list" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
            <li key={i} className="task-skeleton-item">
                <div className="task-skeleton-checkbox skeleton" />
                <div className="task-skeleton-body">
                    <div className="task-skeleton-title skeleton" />
                    <div className="task-skeleton-meta skeleton" />
                </div>
                <div className="task-skeleton-badge skeleton" />
            </li>
        ))}
    </ul>
)
