import React, { useContext } from 'react'
import Aboutus1 from '../images/AboutUs/Aboutusimg.jpg'
import bread from '../images/AboutUs/bread.png'
import s1 from '../images/AboutUs/1.png'
import s2 from '../images/AboutUs/2.png'
import s3 from '../images/AboutUs/3.png'
import s4 from '../images/AboutUs/4.png'
import s5 from '../images/AboutUs/5.png'
import s6 from '../images/AboutUs/6.png'

export default function AboutUsPage() {
    return (
        <div className="container py-5">
            <h1 className="text-center fw-bold mb-5 fs-1">About us</h1>
            <div className="row align-items-center" style={{ borderBottom: '1px solid #eee', paddingBottom: "30px" }}>
                <div className="col-6 text-center mb-4 mb-md-0">
                    <img
                        src={Aboutus1}
                        alt="Chef"
                        className="img-fluid rounded"
                        style={{ Height: '550px', width: "400px" }}
                    />
                </div>

                <div className="col-6 doc" >
                    <div className=" g-3 justify-content-start">
                        <p className='text-success fs-2 fw-bold' style={{ paddingBottom: "40px" }}>
                            Welcome to Foodieland – Your Partner in Smart, Healthy Eating!
                        </p>
                        <p style={{ paddingBottom: "20px" }}>
                            At Foodieland, we believe that food should be both nourishing and enjoyable. We're here to simplify your journey to better health by offering smart meal planning, balanced dishes, and practical nutrition tips—all tailored to fit your lifestyle.
                        </p>
                        <p style={{ paddingBottom: "20px" }}>
                            Whether you're managing a busy schedule, working toward fitness goals, or simply looking to eat more mindfully, Foodieland helps take the guesswork out of eating well. Our mission is to empower you with the tools, knowledge, and inspiration to make healthier food choices every day—without sacrificing flavor or convenience.
                        </p>
                        <p style={{ paddingBottom: "20px" }}>
                            From weekly meal guides to customized nutrition advice, Foodieland is your go-to resource for eating with purpose and pleasure.
                        </p>
                        <p className='text-success fw-semibold fs-3' style={{ paddingBottom: "20px" }}>
                            Eat better. Feel better. Live better—with Foodieland
                        </p>
                    </div>
                </div>
            </div>
            <h1 className="text-center fw-bold mb-5 fs-3" style={{ paddingTop: "90px", paddingBottom: "40px" }}>WHY CHOOSE US</h1>
            <div className="row align-items-center">
                <div className="col-4">
                    <div className="whyus d-flex align-items-center gap-3" style={{ paddingBottom: "40px" }}>
                        <img style={{ width: "90px", height: "90px" }} src={s1} alt='' className=''></img>
                        <div>
                            <p className='fs-5 text-black fw-semibold'>EAT MORE HEALTHFULLY</p>
                            <span className='text-secondary'>Our expert-designed meal plans help you nourish your body with balanced, delicious, and goal-oriented nutrition.</span>
                        </div>
                    </div>
                    <div className="whyus d-flex align-items-center gap-3 " style={{ paddingBottom: "40px" }}>
                        <img style={{ width: "90px", height: "90px" }} src={s2} alt='' className=''></img>
                        <div>
                            <p className='fs-5 text-black fw-semibold'>REPUTATION</p>
                            <p className='text-secondary'>Backed by a community of satisfied users and nutrition professionals, Foodieland is a name you can rely on.</p>
                        </div>
                    </div>
                    <div className="whyus d-flex align-items-center gap-3" style={{ paddingBottom: "40px" }}>
                        <img style={{ width: "90px", height: "90px" }} src={s3} alt='' className=''></img>
                        <div>
                            <p className='fs-5 text-black fw-semibold'>FRESH & NATURAL INGREDIENTS</p>
                            <p className='text-secondary'>We promote meals that use fresh, seasonal, and pesticide-free ingredients for wholesome wellness.</p>
                        </div>
                    </div>
                </div>
                <div className="col-4 ">
                    <img src={bread} alt='bread' style={{ paddingLeft: "50px", width: "350px", height: "580px", paddingBottom: "50px" }}></img>
                </div>
                <div className="col-4 ">
                    <div className="whyus d-flex align-items-center gap-3" style={{ paddingBottom: "40px" }}>
                        <img style={{ width: "90px", height: "90px" }} src={s4} alt='' className=''></img>
                        <div>
                            <p className='fs-5 text-black fw-semibold'>NO COMMITMENT REQUIRED</p>
                            <p className='text-secondary'>Try plans at your own pace—no strings attached. Enjoy total freedom while discovering what works best for you.s</p>
                        </div>
                    </div>
                    <div className="whyus d-flex align-items-center gap-3" style={{ paddingBottom: "40px" }}>
                        <img style={{ width: "90px", height: "90px" }} src={s5} alt='' className=''></img>
                        <div>
                            <p className='fs-5 text-black fw-semibold'>FLEXIBLE PLANNING</p>
                            <p className='text-secondary'>Customize your meals and plans to match your lifestyle, dietary needs, and taste preferences.</p>
                        </div>
                    </div>
                    <div className="whyus d-flex align-items-center gap-3" style={{ paddingBottom: "40px" }}>
                        <img style={{ width: "90px", height: "90px" }} src={s6} alt='' className=''></img>
                        <div>
                            <p className='fs-5 text-black fw-semibold'>COMPLETE CUSTOMIZATION</p>
                            <p className='text-secondary'>From portion sizes to dietary goals, Foodieland adapts to you. Total control, total nourishment.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}