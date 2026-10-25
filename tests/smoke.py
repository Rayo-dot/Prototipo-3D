"""Prueba funcional del HTML autosuficiente, con Internet desconectado."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'dist/index.html').read_text()

with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path='/usr/bin/chromium', headless=True,
        args=['--no-sandbox', '--enable-webgl', '--use-gl=angle',
              '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    )
    context = browser.new_context(viewport={'width': 1440, 'height': 1000},
                                  accept_downloads=True, offline=True)
    page = context.new_page()
    errors = []
    requests = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('request', lambda r: requests.append(r.url))
    page.set_content(HTML, wait_until='load')
    page.wait_for_function('window.__medidor?.rendererReady')
    page.wait_for_timeout(400)
    assert page.locator('canvas').count() == 1
    assert page.evaluate('window.__medidor.view') == 'assembled'
    initial = page.locator('canvas').screenshot()

    page.get_by_role('button', name='Interior', exact=True).click()
    assert page.evaluate('window.__medidor.view') == 'internal'
    page.wait_for_timeout(200)
    assert initial != page.locator('canvas').screenshot(), 'La vista 3D debe cambiar'
    page.get_by_role('button', name='Explosionado', exact=True).click()
    page.wait_for_timeout(800)
    assert page.evaluate('window.__medidor.view') == 'exploded'
    page.screenshot(path='/tmp/medidor-web-exploded.png', full_page=True)

    page.get_by_role('button', name='Mostrar recorrido', exact=False).click()
    assert page.evaluate('window.__medidor.flow') is True
    page.get_by_role('button', name='Ocultar recorrido', exact=False).click()
    assert page.evaluate('window.__medidor.flow') is False

    page.get_by_role('button', name='Ensamblado', exact=True).click()
    page.locator('[data-component="sensor"]').click()
    assert page.evaluate('window.__medidor.view') == 'internal'
    assert page.evaluate('window.__medidor.selected') == 'sensor'
    assert 'Sensor de caudal' in page.locator('#detail-title').inner_text()
    page.locator('[data-component="electronica"]').click()
    assert page.evaluate('window.__medidor.selected') == 'electronica'

    page.get_by_role('button', name='Ver el modelo de frente', exact=True).click()
    page.get_by_role('button', name='Restablecer la cámara', exact=True).click()
    with page.expect_download() as info:
        page.get_by_role('button', name='Guardar imagen del modelo', exact=True).click()
    download = info.value
    assert download.suggested_filename == 'medidor-internal.png'
    download.save_as('/tmp/medidor-descarga.png')
    assert Path('/tmp/medidor-descarga.png').stat().st_size > 10000

    page.locator('#present').click()
    assert page.locator('body').evaluate("e=>e.classList.contains('presentation')")
    page.locator('#present').click()
    assert not page.locator('body').evaluate("e=>e.classList.contains('presentation')")

    # Captura para validar las proporciones del modelo en pantalla pequeña.
    page.set_viewport_size({'width': 390, 'height': 844})
    page.get_by_role('button', name='Ensamblado', exact=True).click()
    page.wait_for_timeout(300)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Desbordamiento horizontal'
    page.screenshot(path='/tmp/medidor-web-mobile.png', full_page=True)
    page.locator('#viewport').screenshot(path='/tmp/medidor-web-mobile-model.png')
    assert not errors, errors
    assert not requests, f'El sitio no debe necesitar red: {requests}'
    browser.close()

print('PASS: modelo WebGL, tres vistas, fichas, recorrido, cámara, PNG, presentación y móvil.')
print('PASS: HTML ejecutado sin conexión y sin solicitudes de red; sin errores JavaScript.')
