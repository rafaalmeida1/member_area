package br.rafaalmeida1.nutri_thata_api.config;

import br.rafaalmeida1.nutri_thata_api.dto.response.ApiResponse;
import org.springframework.core.MethodParameter;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

@ControllerAdvice
public class ApiResponseAdvice implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                                  Class<? extends HttpMessageConverter<?>> selectedConverterType, ServerHttpRequest request,
                                  ServerHttpResponse response) {
        // Evitar envelopar respostas que não são JSON de API
        if (body == null) {
            return ApiResponse.success(null);
        }

        // Já envelopado
        if (body instanceof ApiResponse) {
            return body;
        }

        // Não envelopar recursos estáticos/binários
        String path = request.getURI() != null ? request.getURI().getPath() : "";
        if (body instanceof Resource
                || body instanceof byte[]
                || (selectedContentType != null && (
                    selectedContentType.includes(MediaType.IMAGE_JPEG)
                    || selectedContentType.includes(MediaType.IMAGE_PNG)
                    || selectedContentType.includes(MediaType.IMAGE_GIF)
                    || selectedContentType.includes(MediaType.parseMediaType("image/webp"))
                    || selectedContentType.includes(MediaType.APPLICATION_PDF)
                    || selectedContentType.includes(MediaType.APPLICATION_OCTET_STREAM)
                    || selectedContentType.includes(MediaType.valueOf("video/mp4"))
                    || selectedContentType.includes(MediaType.valueOf("audio/mpeg"))
                ))
                || path.startsWith("/static/")
                || path.startsWith("/uploads/")) {
            return body;
        }

        // Strings (ex: plain text) não devem ser envelopadas para não quebrar conversor
        if (body instanceof String) {
            return body;
        }

        return ApiResponse.success(body);
    }
}


