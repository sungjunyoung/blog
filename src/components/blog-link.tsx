import { Link } from "gatsby"
import * as React from "react"

interface IProps {
  children: React.ReactNode
  to: string
  rel?: "next" | "prev"
}

export const BlogLink = (props: IProps) => {
  const { children, to } = props

  return <Link to={to}>{children}</Link>
}
