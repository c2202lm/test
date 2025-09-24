import Fire from '../images/Home/Fire.png'
import { Link } from 'react-router-dom';

const Slide = ({ id, tagBadge, title, description, time, category, authorImage, authorName, authorDate, image }) => {
    const recipeDetailUrl = `/dish/${id}`;

    return (
        <div className="swiper-slide">
            <div className="row align-items-center h-100 w-100">
                <div className="col-md-6 d-flex flex-column justify-content-center p-5">
                    <span className="tag-badge mb-3 d-inline-block">
                        <img src={Fire} className='fire-icon' />
                        {tagBadge}</span>
                    <h1 className="hero-title fw-bold mb-3">{title}</h1>
                    <p className="hero-description mb-4">{description}</p>
                    <div className="d-flex align-items-center gap-3 mb-4">
                        <span className="badge bg-light text-dark px-3 py-2 rounded-pill"><i className="bi bi-clock me-1"></i> {time}</span>
                        <span className="badge bg-light text-dark px-3 py-2 rounded-pill"><i className="bi bi-egg-fried me-1"></i> {category}</span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3 author-box">
                            <img src="/authorImage.svg" alt="Author" className="rounded-circle author-img" />
                            <div>
                                <strong className="author-name d-block">FoodieChef</strong>
                                <small className="author-date text-muted">{authorDate}</small>
                            </div>
                        </div>
                        <Link to={recipeDetailUrl} className="btn-dark-rounded">View Dish</Link>
                    </div>
                </div>
                <div className="col-md-6 text-center h-100 p-0">
                    <img src={image} alt={title} className="hero-img img-fluid" />
                </div>
            </div>
        </div>
    );
};

export default Slide;