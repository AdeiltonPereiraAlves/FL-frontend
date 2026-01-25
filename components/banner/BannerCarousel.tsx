'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBanners, Banner } from '@/hooks/useBanners'

export function BannerCarousel() {
  const router = useRouter()
  const { banners, isLoading, listarBannersAtivos } = useBanners()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [bannersLocal, setBannersLocal] = useState<Banner[]>([])

  useEffect(() => {
    async function carregarBanners() {
      try {
        const data = await listarBannersAtivos()
        if (data && data.length > 0) {
          setBannersLocal(data)
        } else {
          // Banners padrão para teste se não houver banners cadastrados ou em caso de erro
          setBannersLocal([
            {
              id: '1',
              titulo: 'Banner 1',
              imagemUrl: '/placeholder.jpg',
              tipo: 'URL_EXTERNA',
              urlExterna: '/produtos',
            },
            {
              id: '2',
              titulo: 'Banner 2',
              imagemUrl: '/placeholder.jpg',
              tipo: 'URL_EXTERNA',
              urlExterna: '/produtos',
            },
            {
              id: '3',
              titulo: 'Banner 3',
              imagemUrl: '/placeholder.jpg',
              tipo: 'URL_EXTERNA',
              urlExterna: '/produtos',
            },
            {
              id: '4',
              titulo: 'Banner 4',
              imagemUrl: '/placeholder.jpg',
              tipo: 'URL_EXTERNA',
              urlExterna: '/produtos',
            },
            {
              id: '5',
              titulo: 'Banner 5',
              imagemUrl: '/placeholder.jpg',
              tipo: 'URL_EXTERNA',
              urlExterna: '/produtos',
            },
          ])
        }
      } catch (error) {
        // Este catch agora é apenas uma segurança extra, pois o hook não relança mais o erro
        console.warn('Erro ao carregar banners (usando fallback):', error)
        // Em caso de erro, usa banners padrão
        setBannersLocal([
          {
            id: '1',
            titulo: 'Banner 1',
            imagemUrl: '/placeholder.jpg',
            tipo: 'URL_EXTERNA',
            urlExterna: '/produtos',
          },
        ])
      }
    }

    carregarBanners()
  }, [listarBannersAtivos])

  // Troca automática a cada 3 segundos
  useEffect(() => {
    // Usa bannersLocal se disponível, senão usa banners
    const bannersParaUsar = bannersLocal.length > 0 ? bannersLocal : banners
    
    // Só cria intervalo se houver mais de 1 banner
    if (bannersParaUsar.length <= 1) {
      setCurrentIndex(0)
      return
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 1) % bannersParaUsar.length
        return nextIndex
      })
    }, 3000) // 3 segundos

    return () => clearInterval(interval)
  }, [bannersLocal.length, banners.length]) // Usa apenas o length para evitar recriações desnecessárias

  const handleBannerClick = (banner: Banner) => {
    if (banner.tipo === 'PRODUTO' && banner.produtoId) {
      router.push(`/produto/${banner.produtoId}`)
    } else if (banner.tipo === 'ENTIDADE' && banner.entidadeId) {
      router.push(`/loja/${banner.entidadeId}`)
    } else if (banner.tipo === 'URL_EXTERNA' && banner.urlExterna) {
      if (banner.urlExterna.startsWith('http')) {
        window.open(banner.urlExterna, '_blank')
      } else {
        router.push(banner.urlExterna)
      }
    }
  }

  const bannersParaUsar = bannersLocal.length > 0 ? bannersLocal : banners

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + bannersParaUsar.length) % bannersParaUsar.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % bannersParaUsar.length)
  }

  if (isLoading) {
    return (
      <div className="w-full h-48 sm:h-56 md:h-64 bg-gray-200 animate-pulse rounded-lg"></div>
    )
  }

  if (bannersParaUsar.length === 0) {
    return null
  }

  return (
    <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden rounded-lg shadow-lg group">
      {/* Container dos banners */}
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {bannersParaUsar.map((banner) => (
          <div
            key={banner.id}
            className="min-w-full h-full relative cursor-pointer"
            onClick={() => handleBannerClick(banner)}
          >
            <Image
              src={banner.imagemUrl || '/placeholder.jpg'}
              alt={banner.titulo || 'Banner'}
              fill
              className="object-cover"
              priority={banner.id === bannersParaUsar[0].id}
            />
            {banner.titulo && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                <div className="p-4 sm:p-6 text-white">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{banner.titulo}</h2>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Botões de navegação */}
      {bannersParaUsar.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white z-10 transition-all"
            onClick={(e) => {
              e.stopPropagation()
              goToPrevious()
            }}
            aria-label="Banner anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white z-10 transition-all"
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
            aria-label="Próximo banner"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Indicadores de slide */}
      {bannersParaUsar.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {bannersParaUsar.map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                goToSlide(index)
              }}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
