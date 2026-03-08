import { Link } from 'react-router-dom'
import Card from '../components/Card'

export default function NotFound() {
    return (
        <Card className='py-8 px-8 text-center'>
            <h1 className='text-accent-light text-9xl mb-4'>404</h1>
            <p className='text-text mb-6'>This page doesn't exist.</p>
            <Link to='/' className='text-accent-light hover:underline decoration-accent-light underline-offset-2 transition-colors'>Go home →</Link>
        </Card>
    )
}
