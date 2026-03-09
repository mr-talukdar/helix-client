import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
  className?: string
  imageSize?: number
  textSize?: string
  href?: string
}

export function BrandLogo({ 
  className, 
  imageSize = 32, 
  textSize = "text-xl",
  href = "/"
}: BrandLogoProps) {
  return (
    <Link href={href} className={cn("flex items-center gap-2", className)}>
      <div className="relative flex items-center justify-center overflow-hidden">
        <Image 
          src="/logo.png" 
          alt="HeliX Logo" 
          width={imageSize} 
          height={imageSize}
          className="object-contain"
        />
      </div>
      <span className={cn("font-bold tracking-tight", textSize)}>HeliX</span>
    </Link>
  )
}
