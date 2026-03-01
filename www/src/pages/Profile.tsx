import profileImage from '../assets/profile_image.png'
import { SiGithub, SiInstagram, SiDiscord, SiLinkedin } from 'react-icons/si'

export default function Profile() {
    return (
        <div className='w-full flex flex-col items-center bg-surface border border-border rounded-lg p-4'>
            <div className="w-full flex flex-col sm:flex-row justify-center gap-6 items-center">
                <div className="relative rounded-full w-32 h-48 mr-2 overflow-hidden shrink-0">
                    <img
                        src={profileImage}
                        alt="A young man with long brown hair and dark green eyes."
                        className="object-cover w-full h-full brightness-90 sepia-[0.20] saturate-[1.3]"
                    />
                </div>
                <div className='mt-4 mr-2 text-center md:text-left'>
                    <div className='flex flex-col md:flex-row gap-3 mb-4 items-center'>
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
                    <p className='text-text'>Computer Science Student <span className='mx-1'>•</span> University of St Andrews</p>
                    <p className='mt-2'>Research Intern for the AI Rotate Project</p>
                    <p className='mt-2'>French and Belgian </p>
                </div>
            </div>
            <div className='self-stretch rounded-lg mt-8 text-text-muted mx-6'>
                <p className='mb-2'>I was born in Singapore. By eighteen I'd lived in Tokyo, Athens, Seoul, Mumbai, back to Singapore, then Minnesota. Now Scotland.</p>
                <p className='mb-2'>I study computer science because it combines reasoning, logic, language, psychology, philosophy and science. I compose music, write poetry, and make games.</p>
                <p className='mb-2'>I think a lot about what it means to teach something to think. I'm obsessed with recursion and the number 4.</p>
                <p className='mb-2'>Why does it take lying to get the chance to be honest?</p>
            </div>
        </div>
    )
}