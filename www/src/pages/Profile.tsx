import profileImage from '../assets/profile_image.png'
import { SiGithub, SiInstagram, SiDiscord, SiLinkedin } from 'react-icons/si'

export default function Profile() {
    return (
        <div className="w-full bg-surface border border-border rounded-lg flex px-4 gap-4">
            <div className="relative rounded-full w-32 h-48 mr-2 overflow-hidden">
                <img
                    src={profileImage}
                    alt="A young man with long brown hair and dark green eyes."
                    className="object-cover w-full h-full brightness-90 sepia-[0.20] saturate-[1.3]"
                />
            </div>
            <div className='mt-8 mr-2'>
                <div className='flex gap-3 mb-4 items-center'>
                    <h1 className="text-accent-light text-2xl mr-4">Maxence Morel Dierckx</h1>
                    <div className='flex gap-3'>
                        <a href='https://github.com/MutantCacti' target='_blank' rel='noopener noreferrer' aria-label='GitHub' className='text-text-muted hover:text-accent-light transition-colors rounded-full'>
                            <SiGithub size={20} />
                        </a>
                        <a href='https://www.instagram.com/maxencetmd/' target='_blank' rel='noopener noreferrer' aria-label='Instagram'  className='text-text-muted hover:text-accent-light transition-colors rounded-md'>
                            <SiInstagram size={20} />
                        </a>
                        <a href='https://discord.com/users/mutantcacti' target='_blank' rel='noopener noreferrer' aria-label='Discord'  className='text-text-muted hover:text-accent-light transition-colors rounded-lg'>
                            <SiDiscord size={20} />
                        </a>
                        <a href='https://www.linkedin.com/in/moreldierckxm/' target='_blank' rel='noopener noreferrer' aria-label='Linkedin'  className='text-text-muted hover:text-accent-light transition-colors rounded-sm'>
                            <SiLinkedin size={20} />
                        </a>
                    </div>
                </div>
                <p className="text-text">Computer Science Student <span className='mx-2'>•</span> University of St Andrews</p>
                <p className='mt-2'>Research Intern for the AI Rotate Project</p>
                <p className='mt-2'>French and Belgian </p>
            </div>
        </div>
    )
}