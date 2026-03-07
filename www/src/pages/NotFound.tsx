import { Link } from 'react-router-dom'
import Card from '../components/Card'

export default function NotFound() {
    return (
        <Card className='py-8 px-8 text-center'>
            <Link to='/' className='hover:brightness-[1.1] transition'>
                <h1 className='text-accent-light text-9xl mb-4'>404</h1>
                <p className='text-text mb-6'>This page doesn't exist.</p>
                <p className='text-accent-light'>Go home →</p>
            </Link>
        </Card>
    )
}
