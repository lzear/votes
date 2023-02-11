import { Heading, HeadingProps } from '@chakra-ui/react'

export const H1 = (p: HeadingProps) => <Heading as="h1" size="2xl" {...p} />
export const H2 = (p: HeadingProps) => <Heading as="h2" size="xl" {...p} />
export const H3 = (p: HeadingProps) => <Heading as="h3" size="lg" {...p} />
export const H4 = (p: HeadingProps) => <Heading as="h4" size="md" {...p} />
export const H5 = (p: HeadingProps) => <Heading as="h5" size="sm" {...p} />
export const H6 = (p: HeadingProps) => <Heading as="h6" size="xs" {...p} />
