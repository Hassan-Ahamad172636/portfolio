import React from 'react'
import HomePage from './home/HomePage'
import AboutPage from './about/Page'
import TestimonialsPage from './testimonial/TestimonialPage'
import ProjectPage from './projects/ProjectPage'
import ContactPage from './contact/ContactPage'
import Footer from './footer/Footer'

function MainPage() {
  return (
    <div className=' overflow-hidden'>

      <HomePage />
      <AboutPage />
      <TestimonialsPage />
      <ProjectPage />
      <ContactPage />
      <Footer />
    </div>
  )
}

export default MainPage