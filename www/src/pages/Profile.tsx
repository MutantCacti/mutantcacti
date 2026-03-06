import profileImage from '../assets/images/profile_image.webp'
import { SiGithub, SiInstagram, SiDiscord, SiLinkedin } from 'react-icons/si'
import { HiOutlineDownload } from 'react-icons/hi'
import Card from '../components/Card'

export default function Profile() {
    return (
        <>
            <Card className='w-full flex flex-col items-center pb-8'>
                <div className="w-full flex flex-col sm:flex-row justify-center gap-6 items-center">
                    <div className="relative rounded-full w-32 h-48 mr-2 overflow-hidden shrink-0">
                        <img
                            src={profileImage}
                            alt="A young man with long brown hair and dark green eyes."
                            className="object-cover w-full h-full brightness-90 sepia-[0.20] saturate-[1.3]"
                        />
                    </div>
                    <div className='mt-4 mr-2 text-center sm:text-left'>
                        <div className='flex flex-col sm:flex-row gap-3 mb-4 items-center'>
                            <h1 className="text-accent-light text-2xl sm:mr-4">Maxence Morel Dierckx</h1>
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
                        <span className='text-text flex flex-col sm:flex-row'>
                            <p>Computer Science Student</p> 
                            <span className='hidden sm:block mx-1'>•</span>
                            <p>University of St Andrews</p>
                        </span>
                        <p className='mt-2'>Research Intern for the AI Rotate Project</p>
                        <p className='mt-2'>French and Belgian </p>
                        <div className='flex gap-4 mt-4 text-sm justify-center sm:justify-start'>
                            <a href='mailto:mutantcacti@gmail.com' className='text-text-muted hover:text-accent-light transition-colors rounded-sm'>mutantcacti@gmail.com</a>
                            <span className='text-text-muted'>•</span>
                            <a href='https://docs.google.com/document/d/15s2jYQEbHIwdhUxZAYHXV76J6STfO8PvjGnkocat_XU/export?format=pdf' target='_blank' rel='noopener noreferrer' className='text-text-muted hover:text-accent-light transition-colors inline-flex items-center gap-1 rounded-sm'>Resume <HiOutlineDownload size={14} /></a>
                        </div>
                    </div>
                </div>
            </Card>
            <Card className='self-stretch mt-6 text-accent-subtle p-8'>
                <h2 className='text-accent-light text-2xl mb-4'>About Me</h2>
                <p className='mb-2'>I was born in Singapore. By eighteen I'd lived in Tokyo, Athens, Seoul, Mumbai, back to Singapore, then Minnesota, now Scotland.</p>
                <p className='mb-2'>I study computer science because it combines reasoning, logic, language, psychology, philosophy and science. I compose music, write poetry, and make games.</p>
                <p className='mb-2'>I think a lot about what it means to teach something to think. I like recursion and the number four.</p>
                <p className='mb-2'>Why does it so often take lying to get the chance to be honest?</p>
            </Card>
        </>
    )
}