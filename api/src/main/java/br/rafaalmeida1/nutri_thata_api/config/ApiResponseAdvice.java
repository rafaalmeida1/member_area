package br.rafaalmeida1.nutri_thata_api.config;

import br.rafaalmeida1.nutri_thata_api.dto.response.ApiResponse;
import org.springframework.core.MethodParameter;
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
        // Evitar duplo envelopamento e deixar arquivos estáticos/strings passarem
        if (body == null) {
            return ApiResponse.success(null);
        }
        if (body instanceof ApiResponse) {
            return body;
        }
        if (body instanceof String) {
            return body; // deixe como está para não quebrar conversor StringHttpMessageConverter
        }
        return ApiResponse.success(body);
    }
}


