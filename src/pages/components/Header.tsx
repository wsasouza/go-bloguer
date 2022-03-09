import Image from 'next/image'
import Link from 'next/link'

import logo from '../../assets/go-bloguer.png'

function Header() {
  return (
    <header className="mx-auto flex max-w-7xl justify-between p-5">
      <div className="flex items-center space-x-5">
        <div className="w-44">
          <Link href="/">
            <Image
              src={logo}
              alt="go-bloguer"
              className="cursor-pointer object-contain"
            />
          </Link>
        </div>
        <div className="hidden items-center space-x-5 md:inline-flex">
          <h3>Sobre</h3>
          <h3>Contato</h3>
          <h3 className="rounded-full bg-green-600 px-4 py-1 text-white">
            Seguir
          </h3>
        </div>
      </div>

      <div className="flex items-center space-x-5 text-green-600">
        <h3>Entrar</h3>
        <h3 className="rounded-full border border-green-600 px-4">Começar</h3>
      </div>
    </header>
  )
}

export default Header
